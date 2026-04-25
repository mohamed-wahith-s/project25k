const { supabase } = require('../db');

async function testSearchLogic(s) {
  const conditions = [
    `college_code.ilike.%${s}%`,
    `college_name.ilike.%${s}%`,
    `college_address.ilike.%${s}%`
  ];

  const normalizedSearch = s.replace(/^0+/, '');
  if (normalizedSearch && normalizedSearch !== s) {
    conditions.push(`college_code.eq.${normalizedSearch}`);
  }

  const queryStr = conditions.join(',');
  console.log(`Searching for "${s}", OR conditions: ${queryStr}`);

  const { data, error } = await supabase
    .from('colleges')
    .select('college_code, college_name')
    .or(queryStr)
    .limit(5);

  if (error) {
    console.error('Error:', error);
  } else {
    console.log('Results:', data.map(d => `${d.college_code}: ${d.college_name}`));
  }
}

async function runTests() {
  await testSearchLogic('02');
  await testSearchLogic('1102');
  await testSearchLogic('01');
}

runTests();
