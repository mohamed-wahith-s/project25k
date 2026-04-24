const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkAllTables() {
  const tables = ['users', 'colleges', 'departments', 'cutoff_data'];
  for (const table of tables) {
    const { error } = await supabase.from(table).select('*').limit(1);
    if (error) {
      console.log(`❌ Table '${table}' check:`, error.message);
    } else {
      console.log(`✅ Table '${table}' exists.`);
    }
  }
}

checkAllTables();
