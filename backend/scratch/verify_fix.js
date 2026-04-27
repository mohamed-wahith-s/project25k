async function verify() {
  try {
    const res = await fetch('http://localhost:5000/api/colleges/catalog?pageSize=5');
    const json = await res.json();
    
    if (json.success) {
      console.log('API call successful');
      json.data.forEach(c => {
        console.log(`College: ${c.college_name}, Code: ${c.college_code}, Dept Count: ${c.dept_count}`);
      });
    } else {
      console.error('API call failed', json);
    }
  } catch (err) {
    console.error('Error:', err.message);
  }
}

verify();
