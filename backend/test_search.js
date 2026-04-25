const http = require('http');

http.get('http://localhost:5000/api/colleges/details/01', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    try {
      const parsed = JSON.parse(data);
      console.log('Details Success:', parsed.success, 'Count:', parsed.count);
      console.log('First cutoff:', parsed.data && parsed.data[0]);
    } catch(e) {
      console.log('Parse error:', e);
    }
  });
});
