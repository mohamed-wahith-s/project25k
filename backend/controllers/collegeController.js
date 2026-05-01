const { supabase } = require('../db');

const clampInt = (value, fallback, min, max) => {
  const n = Number.parseInt(value, 10);
  if (Number.isNaN(n)) return fallback;
  return Math.min(Math.max(n, min), max);
};

/**
 * Normalizes a college code into a list of variants to handle padding issues.
 * @param {string} code 
 * @returns {string[]}
 */
const getNormalizedCodeVariants = (code) => {
  if (!code) return [];
  const s = String(code).trim();
  const variants = new Set([s]);
  
  // Handle leading zeros
  const withoutZeros = s.replace(/^0+/, '');
  if (withoutZeros) variants.add(withoutZeros);
  
  // Add common padding (usually 1-4 digits)
  if (withoutZeros.length === 1) variants.add(`0${withoutZeros}`);
  if (withoutZeros.length === 2) variants.add(`00${withoutZeros}`); // Some use 00xx
  if (withoutZeros.length === 3) variants.add(`0${withoutZeros}`);

  return Array.from(variants);
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
    } = { ...req.query, ...req.body }; // Support both GET and POST

    const pageNum = clampInt(page, 1, 1, 100000);
    const sizeNum = clampInt(pageSize, 1000, 1, 5000);
    const from = (pageNum - 1) * sizeNum;
    const to = from + sizeNum - 1;

    // Use !inner join to filter colleges based on cutoff criteria
    let query = supabase
      .from('colleges')
      .select('*, cutoff_data!inner(dept_id, caste_category, cutoff_mark, subject_code)', { count: 'exact' });

    if (cutoff_mark) {
      query = query.lte('cutoff_data.cutoff_mark', parseFloat(cutoff_mark));
    }

    if (caste_category && caste_category !== 'All') {
      query = query.eq('cutoff_data.caste_category', caste_category);
    }

    if (dept_id && dept_id !== 'All') {
      if (String(dept_id).includes(',')) {
        query = query.in('cutoff_data.dept_id', String(dept_id).split(','));
      } else {
        query = query.eq('cutoff_data.dept_id', dept_id);
      }
    }

    if (college_code) {
      const variants = getNormalizedCodeVariants(college_code);
      query = query.in('college_code', variants);
    }

    if (subject_code) {
      query = query.eq('cutoff_data.subject_code', subject_code);
    }

    if (search) {
      const s = String(search).trim();
      if (s.length > 0) {
        query = query.or(`college_name.ilike.%${s}%,college_code.ilike.%${s}%,college_address.ilike.%${s}%`);
      }
    }

    const { data: colleges, error, count } = await query
      .order('college_name', { ascending: true })
      .range(from, to);

    if (error) throw error;

    return res.status(200).json({
      success: true,
      count: colleges.length,
      total: count ?? colleges.length,
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

    const variants = getNormalizedCodeVariants(code);

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
      .in('college_code', variants);

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
    const { search, dept_id, caste_category, cutoff_mark, page = '1', pageSize = '200' } = req.query;
    const pageNum = clampInt(page, 1, 1, 100000);
    const sizeNum = clampInt(pageSize, 200, 1, 2000);
    const from = (pageNum - 1) * sizeNum;
    const to = from + sizeNum - 1;

    const hasDept    = dept_id       && dept_id       !== 'All';
    const hasCaste   = caste_category && caste_category !== 'All';
    const hasCutoff  = cutoff_mark   && !Number.isNaN(parseFloat(cutoff_mark));

    let query;

    if (hasDept || hasCaste || hasCutoff) {
      // Use !inner join so only colleges that have at least one qualifying
      // cutoff_data row (matching dept + caste + cutoff ≤ user mark) are returned.
      query = supabase
        .from('colleges')
        .select(
          'college_code,college_name,college_address, cutoff_data!inner(dept_id,caste_category,cutoff_mark)',
          { count: 'exact' }
        );

      if (hasDept) {
        if (String(dept_id).includes(',')) {
          query = query.in('cutoff_data.dept_id', String(dept_id).split(','));
        } else {
          query = query.eq('cutoff_data.dept_id', dept_id);
        }
      }
      if (hasCaste)  query = query.eq('cutoff_data.caste_category',  caste_category);
      if (hasCutoff) query = query.lte('cutoff_data.cutoff_mark',    parseFloat(cutoff_mark));

      query = query.order('college_name', { ascending: true });
    } else {
      query = supabase
        .from('colleges')
        .select('college_code,college_name,college_address', { count: 'exact' })
        .order('college_name', { ascending: true });
    }

    if (search) {
      const s = String(search).trim();
      if (s.length > 0) {
        const conditions = [
          `college_name.ilike.%${s}%`,
          `college_address.ilike.%${s}%`,
        ];

        // Add all code variants to the search
        const variants = getNormalizedCodeVariants(s);
        variants.forEach(v => {
          conditions.push(`college_code.eq.${v}`);
        });

        // Also keep ilike for partial code matches
        conditions.push(`college_code.ilike.%${s}%`);

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

    const variants = getNormalizedCodeVariants(college_code);

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
      .in('college_code', variants)
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
