const { supabase } = require('../db');

const clampInt = (value, fallback, min, max) => {
  const n = Number.parseInt(value, 10);
  if (Number.isNaN(n)) return fallback;
  return Math.min(Math.max(n, min), max);
};

/**
 * @desc    List departments
 * @route   GET /api/departments
 * @access  Public
 */
exports.getDepartments = async (req, res) => {
  try {
    const { search, page = '1', pageSize = '200' } = req.query;
    const pageNum = clampInt(page, 1, 1, 100000);
    const sizeNum = clampInt(pageSize, 200, 1, 2000);
    const from = (pageNum - 1) * sizeNum;
    const to = from + sizeNum - 1;

    let query = supabase
      .from('departments')
      .select('dept_id,dept_name,subject_code', { count: 'exact' })
      .order('dept_name', { ascending: true })
      .range(from, to);

    if (search) {
      const s = String(search).trim();
      if (s.length > 0) {
        query = query.or([`dept_name.ilike.%${s}%`, `subject_code.ilike.%${s}%`, `dept_id.eq.${Number(s) || -1}`].join(','));
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
    console.error('🔥 Error fetching departments:', err.message);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching departments.',
      error: err.message,
    });
  }
};

