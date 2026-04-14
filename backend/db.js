const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment variables');
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

const connectDB = async () => {
  try {
    // Verify connection by doing a lightweight query
    const { error } = await supabase.from('colleges').select('college_code').limit(1);
    if (error && error.code !== 'PGRST116') {
      // PGRST116 = no rows returned, which is fine - this just means table exists but is empty
      throw error;
    }
    console.log('✅ Supabase PostgreSQL Connected Successfully!');
  } catch (err) {
    console.error('❌ Unable to connect to Supabase:', err.message);
    process.exit(1);
  }
};

module.exports = { supabase, connectDB };
