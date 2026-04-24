const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkUsers() {
  console.log('Using URL:', supabaseUrl);
  const { data, error } = await supabase
    .from('users')
    .select('id, email, username, phone')
    .limit(5);

  if (error) {
    console.error('Error fetching users:', error.message);
  } else {
    console.log('Recent users in DB:', data);
  }
}

checkUsers();
