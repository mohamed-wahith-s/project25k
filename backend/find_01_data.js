const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function cleanMockData() {
  const { error } = await supabase
    .from('cutoff_data')
    .delete()
    .eq('college_code', '01');
    
  if (error) {
    console.error('Error deleting mock data:', error.message);
  } else {
    console.log('Successfully deleted mock data for college 01');
  }
}

cleanMockData();
