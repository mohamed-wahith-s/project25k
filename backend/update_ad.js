const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const updates = [
  { caste: 'OC', rank: 165299, seats: '32/32' },
  { caste: 'BC', rank: 239269, seats: '18/29' },
  { caste: 'BCM', rank: 238211, seats: '2/3' },
  { caste: 'MBC', rank: 218647, seats: '21/21' },
  { caste: 'SC', rank: 234236, seats: '17/17' },
  { caste: 'SCA', rank: 237040, seats: '3/3' },
  { caste: 'ST', rank: 200871, seats: '2/2' },
];

async function updateDB() {
  for (const u of updates) {
    const { error } = await supabase
      .from('cutoff_data')
      .update({
        rank: u.rank,
        seats_filling: u.seats,
        total_seats_in_dept: '95/107'
      })
      .eq('college_code', '2347')
      .eq('subject_code', 'AD')
      .eq('caste_category', u.caste);
      
    if (error) console.error('Error updating', u.caste, error);
    else console.log('Updated', u.caste);
  }
}

updateDB();
