async function verify() {
  try {
    const res = await fetch('http://localhost:5000/api/colleges/catalog?pageSize=10');
    const json = await res.json();
    
    if (json.success) {
      json.data.forEach(c => {
        console.log(`${c.college_name} (${c.college_code}): ${c.dept_count}`);
      });
    }
  } catch (err) {
    console.error('Error:', err.message);
  }
}

verify();
