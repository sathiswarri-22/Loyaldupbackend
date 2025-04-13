const mongoose = require('mongoose');

const performaInvoiceSchema = new mongoose.Schema({
    goodsReturn: {
        type: Boolean,
        required: true
    },
    interestRate: {
        type: Number,
        required: true
    },
    jurisdiction: {
        type: String,
        required: true
    },
    certification: {
        type: String,
        required: true
    },
   
    rows: [{
        itemName: {
            type: String,
            required: true
        },
        quantity: {
            type: Number,
            required: true
        },
        unitPrice: {
            type: Number,
            required: true
        },
        total: {
            type: Number,
            required: true
        }
    }],
    freight: {
        type: Number,
        required: true
    },
    gst: {
        type: Number,
        required: true
    },
    subtotal: {
        type: Number,
        required: true
    },
    roundOff: {
        type: Number,
        required: true
    },
    totalPayable: {
        type: Number,
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model('PI', performaInvoiceSchema);