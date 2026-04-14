const http = require('http');

http.get('http://localhost:5000/api/colleges/1', (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    try {
      const json = JSON.parse(data);
      console.log('Status:', res.statusCode);
      console.log('Success:', json.success);
      console.log('Count:', json.count);
      if (json.data && json.data.length > 0) {
        console.log('Sample Row Dept:', JSON.stringify(json.data[0].departments, null, 2));
        console.log('Sample Row Mark:', json.data[0].cutoff_mark);
      } else {
        console.log('No data returned.');
      }
    } catch (e) {
      console.log('Parse error:', e.message);
      console.log('Raw:', data.substring(0, 100));
    }
  });
}).on('error', (err) => {
  console.log('Error:', err.message);
});
