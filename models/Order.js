const mongoose = require('mongoose');
const orderItemSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  price: { type: Number, required: true, min: 0 },
  quantity: { type: Number, required: true, min: 1 },
  image: { type: String, default: '' },
});
const orderSchema = new mongoose.Schema({
  orderId: { type: String, required: true, unique: true, trim: true },
  userId: { type: String, required: true, index: true },
  customer: {
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
  },
  address: { type: String, required: true, trim: true },
  city: { type: String, required: true, trim: true },
  paymentMethod: { type: String, enum: ['Cash on Delivery', 'UPI'], default: 'Cash on Delivery' },
  items: { type: [orderItemSchema], validate: v => Array.isArray(v) && v.length > 0 },
  subtotal: { type: Number, required: true, min: 0 },
  delivery: { type: Number, required: true, default: 40 },
  total: { type: Number, required: true, min: 0 },
  status: { type: String, enum: ['Pending', 'Preparing', 'Out for Delivery', 'Delivered', 'Cancelled'], default: 'Pending' },
  createdAt: { type: Date, default: Date.now },
});
module.exports = mongoose.model('Order', orderSchema);
