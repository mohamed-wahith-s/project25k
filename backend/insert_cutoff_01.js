const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function insertCutoffs() {
  const mockData = [
    {
      college_code: '01',
      dept_id: '1', // Assuming 1 is CSE or something, let's fetch departments first
      caste_category: 'OC',
      cutoff_mark: 199.5,
      rank: 12,
      total_seats_in_dept: 60,
      seats_filling: 58
    },
    {
      college_code: '01',
      dept_id: '1',
      caste_category: 'BC',
      cutoff_mark: 198.0,
      rank: 45,
      total_seats_in_dept: 60,
      seats_filling: 55
    }
  ];

  // First fetch a valid dept_id
  const { data: depts } = await supabase.from('departments').select('dept_id, dept_name').limit(2);
  
  if (depts && depts.length > 0) {
    mockData[0].dept_id = depts[0].dept_id;
    mockData[1].dept_id = depts[0].dept_id;
    
    // Insert a second department
    if (depts.length > 1) {
      mockData.push({
        college_code: '01',
        dept_id: depts[1].dept_id,
        caste_category: 'OC',
        cutoff_mark: 195.5,
        rank: 150,
        total_seats_in_dept: 60,
        seats_filling: 40
      });
    }

    const { data, error } = await supabase.from('cutoff_data').insert(mockData);
    if (error) {
      console.error('Error inserting cutoffs:', error);
    } else {
      console.log('Successfully inserted mock cutoff data for college 01!');
    }
  } else {
    console.log('No departments found to link cutoff data to.');
  }
}

insertCutoffs();
