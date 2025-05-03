const mongoose = require("mongoose");

const purchaseOrderSchema = new mongoose.Schema({
  Eid: { type: String, required: true },
  deliveryTerms: { type: String, required: true },
  warrantyTerms: { type: String, required: true },
  paymentTerms: { type: String, required: true },
  rows: [
    {
      hsnCode: { type: String, required: true },
      unitDescription: { type: String, required: true },
      Description:{type:String,},
      uom: { type: String, required: true },
      quantity: { type: Number, required: true },
      unitPrice: { type: Number, required: true },
      amount: { type: Number, required: true },
    },
  ],
  payableAmount: { type: Number, required: true },
  gstAmount: { type: Number },
  totalAmount: { type: Number },
  gst: { type: Number, required: true },
  poNumber: { type: String, required: true, unique: true },
  financialYear: { type: String, required: true },
  Address: { type: String, required: true },
  LP:{type: String,},
  discount:{type: String,},
  SupplierName: { type: String, required: true },
  SuppNO: { type: String, required: true },
  RefQNo: { type: String, required: true },
  QDate: { type: String, required: true },
  GSTIN: { type: String, required: true },
  originalPoNumber: { type: String }, // NEW FIELD: reference to original if it's a revision
}, { timestamps: true });

module.exports = mongoose.model("PO13", purchaseOrderSchema);