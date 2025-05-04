const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema({
  goodsReturn: { type: Boolean, required: true },
  interestRate: { type: Number, required: true },
  jurisdiction: { type: String, required: true, trim: true },
  certification: { type: String, required: true, trim: true },
  Eid: { type: String, required: true, trim: true },

  
  rows: [{
    itemName: { type: String, required: true, trim: true },
    quantity: { type: Number, required: true },
    unitPrice: { type: Number, required: true },
    total: { type: Number, required: true }
  }],

  freight: { type: Number, required: true },
  gst: { type: Number, required: true },
  subtotal: { type: Number, required: true },
  roundOff: { type: Number, required: true },
  totalPayable: { type: Number, required: true },

  Status: { type: String, default: "POreq", trim: true },
  financialYear: { type: String, required: true, trim: true },
  referenceNumber: { type: String, required: true, unique: true, trim: true },
  
  name: { type: String, required: true, trim: true },
  address: { type: String, required: true, trim: true },
  gstField: { type: String, required: true, trim: true },
  yourRef: { type: String, required: true, trim: true },

  issueDate: { type: Date, required: true },
  piId: { type: String, required: true, unique: true, trim: true }
}, {
  timestamps: true // adds createdAt and updatedAt fields automatically
});

// Optional: Useful indexes for faster querying
invoiceSchema.index({ financialYear: 1 });
invoiceSchema.index({ Eid: 1 });
invoiceSchema.index({ Status: 1 });

module.exports = mongoose.model('PINew', invoiceSchema);    