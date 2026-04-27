const { supabase } = require('../db');

async function checkDepts() {
  const codes = ['05', '5', '005'];
  
  for (const code of codes) {
    console.log(`\nChecking College Code: ${code}`);
    
    const { data, error } = await supabase
      .from('cutoff_data')
      .select('dept_id')
      .eq('college_code', code);
      
    if (error) {
      console.error(`Error for ${code}:`, error);
      continue;
    }
    
    const uniqueDepts = new Set(data.map(d => d.dept_id));
    console.log(`Total rows in cutoff_data: ${data.length}`);
    console.log(`Unique departments: ${uniqueDepts.size}`);
  }
}

checkDepts();
