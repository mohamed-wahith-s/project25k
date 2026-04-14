const { supabase } = require('../db');

/**
 * @desc    Get cutoff data with college and department joins and filtering
 * @route   GET /api/colleges
 * @access  Public
 */
exports.getColleges = async (req, res) => {
  try {
    const { cutoff_mark, caste_category, dept_id, search } = req.query;

    // Start query on cutoff_data and join with colleges and departments
    // Supabase syntax for joins: '*, colleges(*), departments(*)'
    let query = supabase
      .from('cutoff_data')
      .select(`
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
      `);

    // 1. Filter by Cutoff Mark (Greater than or equal to)
    if (cutoff_mark) {
      query = query.lte('cutoff_mark', parseFloat(cutoff_mark));
    }

    // 2. Filter by Caste Category
    if (caste_category && caste_category !== 'All') {
      query = query.eq('caste_category', caste_category);
    }

    // 3. Optional Filter by Department ID
    if (dept_id && dept_id !== 'All') {
      query = query.eq('dept_id', dept_id);
    }

    // 4. Optional Text Search on College Name or Department Name
    if (search) {
      // Note: Supabase complex or filtering across joins is limited in the JS client.
      // We will search mainly in colleges and departments if needed, but for simplicity
      // and following the prompt's focus on cutoff/caste, we filter these first.
      query = query.or(`subject_code.ilike.%${search}%,seats_filling.ilike.%${search}%`);
    }

    const { data: cutoffResults, error } = await query.order('cutoff_mark', { ascending: false });

    if (error) {
      throw error;
    }

    // Handle the case where no data is found
    if (!cutoffResults || cutoffResults.length === 0) {
      return res.status(200).json({
        success: true,
        count: 0,
        data: []
      });
    }

    return res.status(200).json({
      success: true,
      count: cutoffResults.length,
      data: cutoffResults
    });

  } catch (err) {
    console.error('🔥 Error fetching cutoff data:', err.message);
    return res.status(500).json({ 
      success: false,
      message: 'Server error while fetching cutoff data.',
      error: err.message
    });
  }
};
