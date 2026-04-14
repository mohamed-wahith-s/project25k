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
<<<<<<< HEAD
    const { search } = req.body;
=======
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

    // 0) First get total count safely (head request). This prevents PostgREST
    // "Requested range not satisfiable" errors when clients request pages beyond the end.
    let countQuery = supabase.from('cutoff_data').select('id', { count: 'exact', head: true });

    // 1. Filter by Cutoff Mark (Greater than or equal to)
    if (cutoff_mark) {
      const cm = parseFloat(cutoff_mark);
      countQuery = countQuery.lte('cutoff_mark', cm);
    }

    // 2. Filter by Caste Category
    if (caste_category && caste_category !== 'All') {
      countQuery = countQuery.eq('caste_category', caste_category);
    }

    // 3. Optional Filter by Department ID
    if (dept_id && dept_id !== 'All') {
      countQuery = countQuery.eq('dept_id', dept_id);
    }

    // 4. Optional filter by College Code / Subject Code
    if (college_code) {
      countQuery = countQuery.eq('college_code', college_code);
    }
    if (subject_code) {
      countQuery = countQuery.eq('subject_code', subject_code);
    }

    // 5. Optional Text Search (best-effort across embedded tables)
    if (search) {
      const s = String(search).trim();
      if (s.length > 0) {
        // For counting, we can only reliably search base table fields.
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
>>>>>>> 2378897 (Latest commit)

    // Default query: Fetch institutions and their branch counts
    let query = supabase
      .from('colleges')
      .select('*, cutoff_data(count)')
      .order('college_name', { ascending: true });

    // if search is provided, we search in institution details
    if (search) {
      // Check if search matches college_name or college_code
      query = query.or(`college_name.ilike.%${search}%,college_code.ilike.%${search}%`);
      
      // Note: Full branch search (searching for "CSE" to find colleges) 
      // is most efficiently done via a Database VIEW or RPC in Supabase 
      // for large datasets. For now, we search within the institutions.
    }

    const { data: colleges, error } = await query;

    if (error) throw error;

    return res.status(200).json({
      success: true,
      count: colleges.length,
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

<<<<<<< HEAD
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
=======
    // Re-apply filters for data query (including best-effort search across joins)
    if (cutoff_mark) query = query.lte('cutoff_mark', parseFloat(cutoff_mark));
    if (caste_category && caste_category !== 'All') query = query.eq('caste_category', caste_category);
    if (dept_id && dept_id !== 'All') query = query.eq('dept_id', dept_id);
    if (college_code) query = query.eq('college_code', college_code);
    if (subject_code) query = query.eq('subject_code', subject_code);
    if (search) {
      const s = String(search).trim();
      if (s.length > 0) {
        query = query.or(
          [
            `subject_code.ilike.%${s}%`,
            `seats_filling.ilike.%${s}%`,
            `colleges.college_name.ilike.%${s}%`,
            `departments.dept_name.ilike.%${s}%`,
          ].join(',')
        );
      }
    }

    const safeSortBy = ['cutoff_mark', 'rank', 'dept_id', 'college_code', 'subject_code', 'id'].includes(sortBy)
      ? sortBy
      : 'cutoff_mark';
    const ascending = String(sortOrder).toLowerCase() === 'asc';

    const { data: cutoffResults, error } = await query
      .order(safeSortBy, { ascending, nullsFirst: false })
      .range(from, Math.min(to, total - 1));

    if (error) {
      throw error;
    }

    // Handle the case where no data is found
    if (!cutoffResults || cutoffResults.length === 0) {
      return res.status(200).json({
        success: true,
        count: 0,
        total,
        page: pageNum,
        pageSize: sizeNum,
        data: []
      });
    }

    return res.status(200).json({
      success: true,
      count: cutoffResults.length,
      total,
      page: pageNum,
      pageSize: sizeNum,
      data: cutoffResults
>>>>>>> 2378897 (Latest commit)
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
    const { search, page = '1', pageSize = '200' } = req.query;
    const pageNum = clampInt(page, 1, 1, 100000);
    const sizeNum = clampInt(pageSize, 200, 1, 2000);
    const from = (pageNum - 1) * sizeNum;
    const to = from + sizeNum - 1;

    let query = supabase
      .from('colleges')
      .select('college_code,college_name,college_address', { count: 'exact' })
      .order('college_name', { ascending: true })
      .range(from, to);

    if (search) {
      const s = String(search).trim();
      if (s.length > 0) {
        query = query.or(
          [`college_code.ilike.%${s}%`, `college_name.ilike.%${s}%`, `college_address.ilike.%${s}%`].join(',')
        );
      }
    }

    const { data, error, count } = await query;
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
