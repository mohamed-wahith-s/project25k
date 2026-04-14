const { supabase } = require('../db');

/**
 * @desc    Get all unique institutions from the colleges table
 * @route   GET /api/colleges
 * @access  Public
 */
exports.getCollegesList = async (req, res) => {
  try {
    const { search } = req.body;

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
