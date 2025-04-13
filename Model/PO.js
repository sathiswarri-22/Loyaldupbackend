const mongoose = require("mongoose");

const purchaseOrderSchema = new mongoose.Schema({
  EnquiryNo: { type: String, required: true },
  Eid: { type: String, required: true },
  deliveryTerms: { type: String, required: true },
  warrantyTerms: { type: String, required: true },
  paymentTerms: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  rows: [
    {
      hsnCode: { type: String, required: true },
      unitDescription: { type: String, required: true },
      uom: { type: String, required: true },
      quantity: { type: Number, required: true },
      unitPrice: { type: Number, required: true },
      amount: { type: Number, required: true },
       // Not required, calculated in the app
    },
  ],
  payableAmount: { type: Number, required: true },
  gstAmount: { type: Number },  // Not required, calculated in the app
  totalAmount: { type: Number }, 
  gst: { type: Number, required: true },
});

module.exports = mongoose.model("PO", purchaseOrderSchema);
