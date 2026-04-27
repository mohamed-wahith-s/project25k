async function verify() {
  try {
    // Fetch 50 colleges to see if we get counts for all of them
    const res = await fetch('http://localhost:5000/api/colleges/catalog?pageSize=50');
    const json = await res.json();
    
    if (json.success) {
      console.log('API call successful');
      const zeroCounts = json.data.filter(c => c.dept_count === 0);
      const nonZeroCounts = json.data.filter(c => c.dept_count > 0);
      
      console.log(`Total Colleges: ${json.data.length}`);
      console.log(`Colleges with Dept Count > 0: ${nonZeroCounts.length}`);
      console.log(`Colleges with Dept Count = 0: ${zeroCounts.length}`);
      
      if (nonZeroCounts.length > 0) {
        console.log('\nSample with counts:');
        nonZeroCounts.slice(0, 5).forEach(c => {
          console.log(`- ${c.college_name} (${c.college_code}): ${c.dept_count}`);
        });
      }
      
      // Specifically check 2369
      const gce = json.data.find(c => c.college_code === '2369');
      if (gce) {
        console.log(`\nGovernment College (2369) Count: ${gce.dept_count}`);
      }
    } else {
      console.error('API call failed', json);
    }
  } catch (err) {
    console.error('Error:', err.message);
  }
}

verify();
