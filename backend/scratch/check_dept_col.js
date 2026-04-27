/**
 * Check if dept_count column exists in colleges table
 */
const { supabase } = require('../db');

async function check() {
  const { data, error } = await supabase
    .from('colleges')
    .select('college_code, dept_count')
    .limit(1);

  if (error) {
    console.log('dept_count column does NOT exist yet:', error.message);
  } else {
    console.log('dept_count column EXISTS. Sample:', data);
  }
}

check();
