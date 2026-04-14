const { supabase } = require('../backend/db');

async function debugData() {
  try {
    // Fetch a few rows from cutoff_data with joins
    const { data, error } = await supabase
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
      `)
      .limit(5);

    if (error) throw error;
    
    console.log('--- Sample Data Structure ---');
    console.log(JSON.stringify(data, null, 2));

  } catch (err) {
    console.error('Error fetching data:', err.message);
  } finally {
    process.exit(0);
  }
}

debugData();
