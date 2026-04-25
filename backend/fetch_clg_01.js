const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkCutoffData() {
  const { data, error } = await supabase
    .from('cutoff_data')
    .select('college_code')
    .in('college_code', ['1', '01', ' 1', '001']);
  
  if (error) {
    console.error('Error fetching cutoff:', error.message);
  } else {
    // Count occurrences of each code
    const counts = {};
    data.forEach(r => {
      counts[r.college_code] = (counts[r.college_code] || 0) + 1;
    });
    console.log('Cutoff data counts for college 1:', counts);
  }
}

checkCutoffData();
