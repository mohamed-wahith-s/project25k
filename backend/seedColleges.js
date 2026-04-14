const { supabase } = require('./db');

const seedData = async () => {
  try {
    console.log('🚀 Seeding data for the NEW schema...');

    // 1. Seed Colleges
    const colleges = [
      { college_code: '1', college_name: 'Anna University, CEG Campus', college_address: 'Guindy, Chennai' },
      { college_code: '2', college_name: 'PSG College of Technology', college_address: 'Peelamedu, Coimbatore' }
    ];

    const { error: colError } = await supabase.from('colleges').upsert(colleges);
    if (colError) throw colError;
    console.log('✅ Colleges seeded.');

    // 2. Seed Departments
    const departments = [
      { dept_id: 101, dept_name: 'Computer Science & Engineering', subject_code: 'CSE' },
      { dept_id: 102, dept_name: 'Electronics & Communication', subject_code: 'ECE' }
    ];

    const { error: deptError } = await supabase.from('departments').upsert(departments);
    if (deptError) throw deptError;
    console.log('✅ Departments seeded.');

    // 3. Seed Cutoff Data (Sample)
    const cutoffData = [
      { 
        college_code: '1', 
        dept_id: 101, 
        subject_code: 'CSE', 
        caste_category: 'OC', 
        cutoff_mark: 199.5, 
        rank: 1, 
        seats_filling: 'FULL', 
        total_seats_in_dept: '60' 
      },
      { 
        college_code: '1', 
        dept_id: 101, 
        subject_code: 'CSE', 
        caste_category: 'BC', 
        cutoff_mark: 198.5, 
        rank: 45, 
        seats_filling: 'NEARLY FULL', 
        total_seats_in_dept: '60' 
      },
      { 
        college_code: '2', 
        dept_id: 102, 
        subject_code: 'ECE', 
        caste_category: 'MBC', 
        cutoff_mark: 192.0, 
        rank: 250, 
        seats_filling: 'PARTIAL', 
        total_seats_in_dept: '120' 
      }
    ];

    const { error: cutoffError } = await supabase.from('cutoff_data').insert(cutoffData);
    if (cutoffError) throw cutoffError;
    console.log('✅ Cutoff data seeded.');

    console.log('\n🎉 ALL DONE! Your database is now ready to test.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding failed:', err.message);
    process.exit(1);
  }
};

seedData();
