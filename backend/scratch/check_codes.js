const { supabase } = require('../db');

async function checkCodes() {
  const { data, error } = await supabase
    .from('colleges')
    .select('college_code, college_name')
    .limit(100);

  if (error) {
    console.error(error);
    return;
  }

  console.log('Sample College Codes:');
  data.forEach(c => console.log(`Code: "${c.college_code}", Name: "${c.college_name}"`));
  
  const { data: searchData, error: searchError } = await supabase
    .from('colleges')
    .select('college_code, college_name')
    .or('college_code.ilike.%02%,college_name.ilike.%02%')
    .limit(10);
    
  console.log('\nSearch results for "02":');
  searchData?.forEach(c => console.log(`Code: "${c.college_code}", Name: "${c.college_name}"`));
}

checkCodes();
