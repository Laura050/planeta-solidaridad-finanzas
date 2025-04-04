const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  applicationId: {
    type: String,
    required: true,
    ref: 'Application'
  },
  content: {
    type: String,
    required: true
  },
  from: {
    type: String,
    required: true,
    enum: ['user', 'admin']
  },
  attachmentUrl: {
    type: String
  },
  time: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Message', MessageSchema);
