const fetch = require('node-fetch');

async function testDetailEndpoint() {
  const API_URL = 'http://localhost:5000/api/colleges/1'; // Example code
  try {
    const res = await fetch(API_URL);
    const json = await res.json();
    console.log('Status:', res.status);
    console.log('Success:', json.success);
    console.log('Count:', json.count);
    if (json.data && json.data.length > 0) {
      console.log('Sample Row:', JSON.stringify(json.data[0], null, 2));
    } else {
      console.log('No data returned.');
    }
  } catch (err) {
    console.error('Error:', err.message);
  }
}

testDetailEndpoint();
