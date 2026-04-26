const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkUserApplications() {
  const { data, error } = await supabase.from('user_applications').select('*').limit(1);
  if (error) {
    console.error('❌ Table user_applications check failed:', error.message);
  } else {
    console.log('✅ Table user_applications exists.');
    if (data && data.length > 0) {
      console.log('Columns found:', Object.keys(data[0]).join(', '));
    } else {
        console.log('Table exists but is empty. Cannot determine columns via select.');
    }
  }
}

checkUserApplications();
