const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const { isDBConnected } = require('../config/db');

const inMemoryOrders = [];
const generateOrderId = () => `DD${Date.now()}${Math.floor(100 + Math.random() * 900)}`;

function requireAuth(req, res, next) {
  if (!req.session.user) return res.status(401).json({ success: false, message: 'Please log in to continue.' });
  next();
}

router.post('/', requireAuth, async (req, res) => {
  try {
    const { customer, address, city, paymentMethod, items } = req.body;
    if (!customer?.name || !customer?.phone || !customer?.email) return res.status(400).json({ success: false, message: 'Customer information is required.' });
    if (!address || !city) return res.status(400).json({ success: false, message: 'Delivery address and city are required.' });
    if (!Array.isArray(items) || !items.length) return res.status(400).json({ success: false, message: 'Your cart is empty.' });
    if (!/^[0-9+ -]{8,15}$/.test(customer.phone.trim())) return res.status(400).json({ success: false, message: 'Please provide a valid phone number.' });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer.email.trim())) return res.status(400).json({ success: false, message: 'Please provide a valid email address.' });

    const calculatedSubtotal = items.reduce((sum, item) => sum + (Number(item.price) || 0) * (Number(item.quantity) || 1), 0);
    const delivery = calculatedSubtotal > 0 ? 40 : 0;
    const orderData = {
      orderId: generateOrderId(),
      userId: String(req.session.user.id),
      customer: { name: customer.name.trim(), phone: customer.phone.trim(), email: customer.email.trim().toLowerCase() },
      address: address.trim(), city: city.trim(),
      paymentMethod: paymentMethod === 'UPI' ? 'UPI' : 'Cash on Delivery',
      items: items.map(i => ({ name: i.name, price: Number(i.price), quantity: Number(i.quantity) || 1, image: i.image || '' })),
      subtotal: calculatedSubtotal, delivery, total: calculatedSubtotal + delivery,
      status: 'Pending', createdAt: new Date(),
    };

    let saved = orderData;
    if (isDBConnected()) saved = await Order.create(orderData);
    else inMemoryOrders.push(orderData);
    res.status(201).json({ success: true, message: 'Order placed successfully!', order: saved });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ success: false, message: 'An error occurred while processing your order.' });
  }
});

router.get('/history', requireAuth, async (req, res) => {
  try {
    let orders;
    if (isDBConnected()) orders = await Order.find({ userId: String(req.session.user.id) }).sort({ createdAt: -1 });
    else orders = inMemoryOrders.filter(o => String(o.userId) === String(req.session.user.id)).sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json({ success: true, orders });
  } catch (error) {
    console.error('History error:', error);
    res.status(500).json({ success: false, message: 'Unable to load order history.' });
  }
});

router.get('/:id', requireAuth, async (req, res) => {
  try {
    let order;
    if (isDBConnected()) order = await Order.findOne({ orderId: req.params.id, userId: String(req.session.user.id) });
    else order = inMemoryOrders.find(o => o.orderId === req.params.id && String(o.userId) === String(req.session.user.id));
    if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });
    res.json({ success: true, order });
  } catch (error) { res.status(500).json({ success: false, message: 'Error fetching order details.' }); }
});

module.exports = router;
