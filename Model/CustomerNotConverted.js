const mongoose = require('mongoose');

const customernotconverted = new mongoose.Schema({
  EnquiryNo: {
    type: String,
    required: true
  },
  remarks: {
    type: String,
    required: true
  },
  Eid: {  
    type: String,  
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('CustomerNotConverted', customernotconverted);
