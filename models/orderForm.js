const mongoose = require('mongoose');

// Define Schema
const OrderSchema = new mongoose.Schema({
  orderDate: {
    type: Date,
    required: true,
  },
  orderTime: {
    type: String,
    required: true,
  },
  orderNote: {
    type: String,
  },
  orderDetails: {
    type: String,
    required: true,
  },
  orderTaker: {
    type: String,
    required: true,
  },
  customerName: {
    type: String,
    required: true,
  },
  customerNumber: {
    type: String,
    required: true,
  },
  paymentStatus: {
    type: String,
    enum: ['done', 'half', 'pending'],
    required: true,
  },
  amountPaid: {
    type: Number,
    validate: {
      validator: function (v) {
        // Validate if amountPaid is required based on paymentStatus
        if (this.paymentStatus === 'half') {
          return typeof v === 'number';
        }
        return true; // Allow any value if paymentStatus is not 'half'
      },
      message: 'Amount paid must be a number when payment status is half.',
    },
  },
  amountRest: {
    type: Number,
    validate: {
      validator: function (v) {
        // Validate if amountRest is required based on paymentStatus
        if (this.paymentStatus === 'half') {
          return typeof v === 'number';
        }
        return true; // Allow any value if paymentStatus is not 'half'
      },
      message: 'Amount remaining must be a number when payment status is half.',
    },
  },
  easternDate: {
    type: String,
  },
  easternTime: {
    type: String,
  },
});

const OrderForm = mongoose.model('OrderForm', OrderSchema);

module.exports = OrderForm;
