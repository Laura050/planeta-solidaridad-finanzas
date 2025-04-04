const mongoose = require('mongoose');

const ApplicationSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  type: {
    type: String,
    required: true,
    enum: ['Personal', 'Vivienda', 'Educación', 'Negocio']
  },
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  city: {
    type: String,
    required: true
  },
  address: {
    type: String,
    required: true
  },
  dni: {
    type: String,
    required: true
  },
  documentUrl: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  term: {
    type: Number,
    required: true
  },
  payment: {
    type: Number,
    required: true
  },
  income: {
    type: Number,
    required: true
  },
  purpose: {
    type: String,
    required: true
  },
  status: {
    type: String,
    required: true,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  date: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Application', ApplicationSchema);
