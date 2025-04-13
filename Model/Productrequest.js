const mongoose = require('mongoose');

const ProductrequestSchema = new mongoose.Schema({
  Eid: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  companyName: {
    type: String,
    required: true,
  },
  contactpersonname: {
    type: String,
    required: true,
  },
  productDetails: [  
    {
      productname: {
        type: String,
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
      },
    },
  ],
  Description: {
    type: String,
    required: true,
  },
  Employeeid: {
    type: String,
    required: true,
  },
  Status: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model('Allproductrequest', ProductrequestSchema);
