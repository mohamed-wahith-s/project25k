const { supabase } = require('../db');

const clampInt = (value, fallback, min, max) => {
  const n = Number.parseInt(value, 10);
  if (Number.isNaN(n)) return fallback;
  return Math.min(Math.max(n, min), max);
};

/**
 * @desc    Get all unique institutions from the colleges table
 * @route   GET /api/colleges
 * @access  Public
 */
exports.getCollegesList = async (req, res) => {
  try {
    const {
      cutoff_mark,
      caste_category,
      dept_id,
      college_code,
      subject_code,
      search,
      page = '1',
      pageSize = '1000',
      sortBy = 'cutoff_mark',
      sortOrder = 'desc',
    } = req.query;

    const pageNum = clampInt(page, 1, 1, 100000);
    const sizeNum = clampInt(pageSize, 1000, 1, 5000);
    const from = (pageNum - 1) * sizeNum;
    const to = from + sizeNum - 1;

    // 0) First get total count safely (head request).
    let countQuery = supabase.from('cutoff_data').select('id', { count: 'exact', head: true });

    if (cutoff_mark) {
      const cm = parseFloat(cutoff_mark);
      countQuery = countQuery.lte('cutoff_mark', cm);
    }

    if (caste_category && caste_category !== 'All') {
      countQuery = countQuery.eq('caste_category', caste_category);
    }

    if (dept_id && dept_id !== 'All') {
      countQuery = countQuery.eq('dept_id', dept_id);
    }

    if (college_code) {
      countQuery = countQuery.eq('college_code', college_code);
    }
    if (subject_code) {
      countQuery = countQuery.eq('subject_code', subject_code);
    }

    if (search) {
      const s = String(search).trim();
      if (s.length > 0) {
        countQuery = countQuery.or([`subject_code.ilike.%${s}%`, `seats_filling.ilike.%${s}%`].join(','));
      }
    }

    const { count: totalCount, error: countError } = await countQuery;
    if (countError) throw countError;
    const total = totalCount ?? 0;

    if (total === 0 || from >= total) {
      return res.status(200).json({
        success: true,
        count: 0,
        total,
        page: pageNum,
        pageSize: sizeNum,
        data: [],
      });
    }

    // Default query: Fetch institutions and their branch counts
    let query = supabase
      .from('colleges')
      .select('*, cutoff_data!inner(count)', { count: 'exact' })
      .order('college_name', { ascending: true });

    // Apply Department filter if provided
    if (dept_id && dept_id !== 'All') {
      query = query.eq('cutoff_data.dept_id', dept_id);
    }

    // if search is provided, we search in institution details
    if (search) {
      query = query.or(`college_name.ilike.%${search}%,college_code.ilike.%${search}%`);
    }

    const { data: colleges, error } = await query.range(from, to);

    if (error) throw error;

    return res.status(200).json({
      success: true,
      count: colleges.length,
      total,
      page: pageNum,
      pageSize: sizeNum,
      data: colleges
    });
  } catch (err) {
    console.error('🔥 Error fetching colleges list:', err.message);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching institutions.',
      error: err.message
    });
  }
};

/**
 * @desc    Get specific cutoff data for a requested college code
 * @route   GET /api/colleges/:code
 * @access  Public
 */
exports.getCollegeByCode = async (req, res) => {
  try {
    const { code, cutoff_mark, caste_category } = req.body;

    if (!code) {
      return res.status(400).json({ success: false, message: 'College code is required.' });
    }

    // Normalized codes to handle padding differences (e.g. "1" matches "01")
    const codeVariants = [code];
    if (code.length === 1) codeVariants.push(`0${code}`);
    if (code.length === 2 && !code.startsWith('0')) codeVariants.unshift(`0${code}`); 
    if (code.length === 2 && code.startsWith('0')) codeVariants.push(code.substring(1));

    // Fetch detailed cutoff data joined with departments for this specific college
    let query = supabase
      .from('cutoff_data')
      .select(`
        *,
        departments (
          dept_id,
          dept_name,
          subject_code
        )
      `)
      .in('college_code', codeVariants);

    // Optional Filtering
    if (cutoff_mark) {
      query = query.lte('cutoff_mark', parseFloat(cutoff_mark));
    }
    if (caste_category && caste_category !== 'All') {
      query = query.eq('caste_category', caste_category);
    }

    const { data: details, error } = await query.order('cutoff_mark', { ascending: false });

    if (error) throw error;

    return res.status(200).json({
      success: true,
      count: details.length,
      data: details
    });
  } catch (err) {
    console.error(`🔥 Error fetching details for college ${req.params.code}:`, err.message);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching college details.',
      error: err.message
    });
  }
};

/**
 * @desc    List colleges (catalog)
 * @route   GET /api/colleges/catalog
 * @access  Public
 */
exports.getCollegeCatalog = async (req, res) => {
  try {
    const { search, dept_id, caste_category, page = '1', pageSize = '200' } = req.query;
    const pageNum = clampInt(page, 1, 1, 100000);
    const sizeNum = clampInt(pageSize, 200, 1, 2000);
    const from = (pageNum - 1) * sizeNum;
    const to = from + sizeNum - 1;

    let query = supabase
      .from('colleges')
      .select('college_code,college_name,college_address', { count: 'exact' })
      .order('college_name', { ascending: true });

    const hasDept = dept_id && dept_id !== 'All';
    const hasCaste = caste_category && caste_category !== 'All';

    if (hasDept || hasCaste) {
      // Use !inner to filter colleges that have matching rows in cutoff_data
      query = supabase
        .from('colleges')
        .select('college_code,college_name,college_address, cutoff_data!inner(dept_id, caste_category)', { count: 'exact' });
      
      if (hasDept) query = query.eq('cutoff_data.dept_id', dept_id);
      if (hasCaste) query = query.eq('cutoff_data.caste_category', caste_category);
      
      query = query.order('college_name', { ascending: true });
    }

    if (search) {
      const s = String(search).trim();
      if (s.length > 0) {
        const conditions = [
          `college_code.ilike.%${s}%`,
          `college_name.ilike.%${s}%`,
          `college_address.ilike.%${s}%`
        ];

        // Handle leading zeros (e.g., search "02" should match college_code "2")
        const normalizedSearch = s.replace(/^0+/, '');
        if (normalizedSearch && normalizedSearch !== s) {
          conditions.push(`college_code.eq.${normalizedSearch}`);
        }

        query = query.or(conditions.join(','));
      }
    }

    const { data, error, count } = await query.range(from, to);
    if (error) throw error;

    return res.status(200).json({
      success: true,
      count: data?.length ?? 0,
      total: count ?? (data?.length ?? 0),
      page: pageNum,
      pageSize: sizeNum,
      data: data ?? [],
    });
  } catch (err) {
    console.error('🔥 Error fetching colleges catalog:', err.message);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching colleges catalog.',
      error: err.message,
    });
  }
};

/**
 * @desc    Get full cutoff rows for one college (no missing departments)
 * @route   GET /api/colleges/details/:college_code
 * @access  Public
 */
exports.getCollegeDetails = async (req, res) => {
  try {
    const { college_code } = req.params;
    if (!college_code) {
      return res.status(400).json({ success: false, message: 'college_code is required' });
    }

    const { data, error } = await supabase
      .from('cutoff_data')
      .select(
        `
        *,
        colleges (
          college_code,
          college_name,
          college_address
        ),
        departments (
          dept_id,
          dept_name,
          subject_code
        )
      `
      )
      .eq('college_code', college_code)
      .order('dept_id', { ascending: true, nullsFirst: false })
      .order('caste_category', { ascending: true, nullsFirst: false })
      .order('id', { ascending: true });

    if (error) throw error;

    return res.status(200).json({
      success: true,
      count: data?.length ?? 0,
      data: data ?? [],
    });
  } catch (err) {
    console.error('🔥 Error fetching college details:', err.message);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching college details.',
      error: err.message,
    });
  }
};

/**
 * @desc    Get all unique departments
 * @route   GET /api/colleges/departments
 * @access  Public
 */
exports.getDepartments = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('departments')
      .select('*')
      .order('dept_name', { ascending: true });

    if (error) throw error;

    return res.status(200).json({
      success: true,
      count: data.length,
      data
    });
  } catch (err) {
    console.error('🔥 Error fetching departments:', err.message);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching departments.',
      error: err.message
    });
  }
};
