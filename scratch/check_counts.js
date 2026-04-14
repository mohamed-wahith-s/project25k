const { supabase } = require('../backend/db');

async function countColleges() {
  try {
    const { count, error } = await supabase
      .from('colleges')
      .select('*', { count: 'exact', head: true });

    if (error) throw error;
    console.log(`Total colleges in database: ${count}`);
    
    // Also count cutoff rows to see if everything is linked
    const { count: cutoffCount, error: cutoffError } = await supabase
      .from('cutoff_data')
      .select('*', { count: 'exact', head: true });
      
    if (cutoffError) throw cutoffError;
    console.log(`Total cutoff data rows: ${cutoffCount}`);

  } catch (err) {
    console.error('Error counting:', err.message);
  } finally {
    process.exit(0);
  }
}

countColleges();
