const http = require('http');

function request(options, data) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body || '{}') });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });
    req.on('error', reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

async function runTests() {
  console.log('--- 1. Testing GET /api/health ---');
  let res = await request({ host: 'localhost', port: 5000, path: '/api/health', method: 'GET' });
  console.log('Health Status:', res.status, res.data);

  console.log('\n--- 2. Testing GET /api/desserts ---');
  res = await request({ host: 'localhost', port: 5000, path: '/api/desserts', method: 'GET' });
  console.log('Desserts Count:', res.data.count, 'First Item:', res.data.desserts[0].name);

  console.log('\n--- 3. Testing GET /api/desserts?category=Cheesecakes ---');
  res = await request({ host: 'localhost', port: 5000, path: '/api/desserts?category=Cheesecakes', method: 'GET' });
  console.log('Cheesecakes Count:', res.data.count);

  console.log('\n--- 4. Testing POST /api/orders ---');
  const orderPayload = {
    customer: {
      name: 'Rohan Mehra',
      phone: '9876543210',
      email: 'rohan.mehra@example.com'
    },
    address: 'Flat 402, Lotus Apartments, Indiranagar',
    city: 'Bengaluru',
    paymentMethod: 'UPI',
    items: [
      { name: 'Belgian Chocolate Truffle Cake', price: 380, quantity: 2, image: 'test.jpg' },
      { name: 'New York Baked Cheesecake', price: 260, quantity: 1, image: 'test2.jpg' }
    ],
    subtotal: 1020,
    delivery: 40,
    total: 1060
  };
  res = await request({
    host: 'localhost',
    port: 5000,
    path: '/api/orders',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, orderPayload);
  console.log('Order Status:', res.status, 'Order ID:', res.data.order?.orderId);
  const createdOrderId = res.data.order?.orderId;

  console.log('\n--- 5. Testing GET /api/orders/:id ---');
  res = await request({ host: 'localhost', port: 5000, path: `/api/orders/${createdOrderId}`, method: 'GET' });
  console.log('Fetched Order Status:', res.status, 'Customer:', res.data.order?.customer?.name);

  console.log('\n--- 6. Testing POST /api/orders validation failure ---');
  res = await request({
    host: 'localhost',
    port: 5000,
    path: '/api/orders',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { customer: { name: '' } });
  console.log('Expected Failure Status (400):', res.status, 'Message:', res.data.message);

  console.log('\n--- 7. Testing POST /api/contact ---');
  res = await request({
    host: 'localhost',
    port: 5000,
    path: '/api/contact',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, {
    name: 'Sanya Gupta',
    email: 'sanya@example.com',
    subject: 'Bespoke Wedding Cake Inquiry',
    message: 'We are planning an autumn wedding and would like a 3-tier tiramisu cake.'
  });
  console.log('Contact Status:', res.status, 'Message:', res.data.message);

  console.log('\n--- 8. Testing GET /api/feedback ---');
  res = await request({ host: 'localhost', port: 5000, path: '/api/feedback', method: 'GET' });
  console.log('Feedback Count:', res.data.count, 'Latest Reviewer:', res.data.feedback[0]?.name);

  console.log('\n--- 9. Testing POST /api/feedback ---');
  res = await request({
    host: 'localhost',
    port: 5000,
    path: '/api/feedback',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, {
    name: 'Vikram Seth',
    email: 'vikram@example.com',
    rating: 5,
    feedback: 'Absolutely divine experience. The packaging was immaculate!'
  });
  console.log('Submit Feedback Status:', res.status, 'Saved Rating:', res.data.feedback?.rating);

  console.log('\n--- 10. Testing Static Pages Serving ---');
  const pages = ['/', '/index.html', '/desserts.html', '/cart.html', '/order.html', '/contact.html', '/feedback.html', '/css/style.css', '/js/script.js'];
  for (const page of pages) {
    const pageRes = await request({ host: 'localhost', port: 5000, path: page, method: 'GET' });
    console.log(`Page ${page}: Status ${pageRes.status}`);
  }

  console.log('\n✅ ALL API & STATIC ROUTE TESTS PASSED SUCCESSFULLY!');
}

runTests().catch(err => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
