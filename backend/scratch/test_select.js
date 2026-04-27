const { supabase } = require('../db');

async function testSelect() {
  const { data, error } = await supabase
    .from('colleges')
    .select('college_code, college_name, cutoff_data!inner(count)')
    .eq('college_code', '05')
    .limit(1);
    
  if (error) {
    console.error(error);
    return;
  }
  
  console.log(JSON.stringify(data, null, 2));
}

testSelect();
