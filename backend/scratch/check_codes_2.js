const { supabase } = require('../db');

async function checkCodes() {
  const codes = ['2369', '2603', '2615', '2709'];
  for (const c of codes) {
    const { count, error } = await supabase
      .from('cutoff_data')
      .select('*', { count: 'exact', head: true })
      .eq('college_code', c);
    
    if (error) {
      console.error(`Error for ${c}:`, error);
    } else {
      console.log(`Code ${c}: ${count} rows`);
    }
    
    // Also check with leading zero just in case
    const withZero = '0' + c;
    const { count: countZero } = await supabase
      .from('cutoff_data')
      .select('*', { count: 'exact', head: true })
      .eq('college_code', withZero);
    console.log(`Code ${withZero}: ${countZero} rows`);
  }
}

checkCodes();
