const axios = require('axios');
const BASE = 'http://localhost:5000/api';

async function testFlow() {
  try {
    // 1. Login as Bombay Brasserie owner
    console.log('--- Step 1: Login as Bombay Brasserie owner ---');
    const restLogin = await axios.post(BASE + '/auth/login', { email: 'deepa.mukherjee@gmail.com', password: 'Password@123' });
    const restToken = restLogin.data.data.token;
    console.log('Logged in as:', restLogin.data.data.user.name, '| Role:', restLogin.data.data.user.role);

    // 2. Get business orders
    console.log('\n--- Step 2: Get business orders ---');
    const ordersRes = await axios.get(BASE + '/orders/business', { headers: { Authorization: 'Bearer ' + restToken } });
    const orders = ordersRes.data.data?.orders || ordersRes.data?.orders || [];
    console.log('Total orders:', orders.length);
    
    let latestOrder;
    if (orders.length === 0) {
      console.log('No orders found. Placing a new order first...');
      
      const custLogin = await axios.post(BASE + '/auth/login', { email: 'aarav.sharma@gmail.com', password: 'Password@123' });
      const custToken = custLogin.data.data.token;
      console.log('Customer logged in:', custLogin.data.data.user.name);

      const restListRes = await axios.get(BASE + '/restaurants');
      const allRest = restListRes.data.data?.restaurants || [];
      const bombay = allRest.find(r => r.name.includes('Bombay'));
      if (!bombay) { console.log('Bombay Brasserie not found!'); return; }
      console.log('Found Bombay Brasserie:', bombay._id);

      const menuRes = await axios.get(BASE + '/menu/restaurant/' + bombay._id);
      const menuItems = menuRes.data.data?.menuItems || [];
      console.log('Menu items:', menuItems.length);
      if (menuItems.length === 0) { console.log('No menu items!'); return; }

      const orderItems = menuItems.slice(0, 2).map(m => ({ menuItem: m._id, name: m.name, price: m.price, quantity: 1 }));
      const total = orderItems.reduce((s, i) => s + i.price, 0);
      console.log('Ordering:', orderItems.map(i => i.name).join(', '), '| Total:', total);

      const newOrder = await axios.post(BASE + '/orders', {
        restaurant: bombay._id,
        items: orderItems,
        totalAmount: total + 35,
        deliveryFee: 35,
        deliveryAddress: { street: '123 MG Road', city: 'Mumbai', state: 'Maharashtra', zipCode: '400001' },
        paymentMethod: 'cod',
      }, { headers: { Authorization: 'Bearer ' + custToken } });
      
      latestOrder = newOrder.data.data?.order;
      console.log('Order placed:', latestOrder._id, '| Status:', latestOrder.status);
    } else {
      latestOrder = orders[0];
    }

    console.log('\nWorking with Order:', latestOrder._id, '| Current Status:', latestOrder.status);

    // 3. Confirm order
    if (latestOrder.status === 'placed') {
      console.log('\n--- Step 3: Confirm order ---');
      const r = await axios.patch(BASE + '/orders/' + latestOrder._id + '/status', { status: 'confirmed' }, { headers: { Authorization: 'Bearer ' + restToken } });
      console.log('Status:', r.data.data?.order?.status);
    }

    // 4. Mark preparing
    console.log('\n--- Step 4: Mark preparing ---');
    const prepRes = await axios.patch(BASE + '/orders/' + latestOrder._id + '/status', { status: 'preparing' }, { headers: { Authorization: 'Bearer ' + restToken } });
    console.log('Status:', prepRes.data.data?.order?.status);

    // 5. Mark ready (triggers delivery dispatch)
    console.log('\n--- Step 5: Mark ready (dispatch to delivery partners) ---');
    const readyRes = await axios.patch(BASE + '/orders/' + latestOrder._id + '/status', { status: 'ready' }, { headers: { Authorization: 'Bearer ' + restToken } });
    console.log('Status:', readyRes.data.data?.order?.status);

    // 6. Login as Delivery Partner
    console.log('\n--- Step 6: Login as Delivery Partner ---');
    const delLogin = await axios.post(BASE + '/auth/login', { email: 'ravi.kumar@gmail.com', password: 'Password@123' });
    const delToken = delLogin.data.data.token;
    console.log('Logged in as:', delLogin.data.data.user.name);

    // 7. Get available deliveries
    console.log('\n--- Step 7: Available deliveries ---');
    const available = await axios.get(BASE + '/deliveries/available', { headers: { Authorization: 'Bearer ' + delToken } });
    const avail = available.data.data?.orders || [];
    console.log('Available:', avail.length);

    // 8. Accept delivery
    console.log('\n--- Step 8: Accept delivery (pickedUp) ---');
    const acceptRes = await axios.patch(BASE + '/deliveries/' + latestOrder._id + '/accept', {}, { headers: { Authorization: 'Bearer ' + delToken } });
    console.log('Status:', acceptRes.data.data?.order?.status || acceptRes.data.message);

    // 9. Out for delivery
    console.log('\n--- Step 9: Out for delivery ---');
    const outRes = await axios.patch(BASE + '/deliveries/out-for-delivery/' + latestOrder._id, {}, { headers: { Authorization: 'Bearer ' + delToken } });
    console.log('Status:', outRes.data.data?.order?.status || outRes.data.message);

    // 10. Delivered
    console.log('\n--- Step 10: Mark delivered ---');
    const deliveredRes = await axios.patch(BASE + '/deliveries/' + latestOrder._id + '/complete', {}, { headers: { Authorization: 'Bearer ' + delToken } });
    console.log('Status:', deliveredRes.data.data?.order?.status || deliveredRes.data.message);

    console.log('\n=== FULL ORDER LIFECYCLE COMPLETE ===');
    console.log('placed -> confirmed -> preparing -> ready -> pickedUp -> outForDelivery -> delivered');

  } catch (err) {
    console.error('ERROR:', err.config?.url);
    console.error('Response:', err.response?.status, err.response?.data?.message || err.message);
  }
}
testFlow();
