const mongoose = require('mongoose');

const Salesorderschema = new mongoose.Schema({
    orderId: 
    { type: String,
      required: true,
       unique: true 
    },
    customername : {
        type : String,
        required : true
    },
    subject : {
        type : String,
        required : true
    },
    status : {
        type : String,
        required : true
    },
    POnumber : {
        type : String,
        required : true
    },
    paymentTerms : {
        type : String,
        required : true
    },
    Quotenumber : {
        type : String,
        required : true
    },
    salesOrderDate : {
        type : String,
        required : true
    },
    AssignedTo : {
        type : String,
        required : true
    },
    PoDate : {
        type : Date,
        required : true,
        default: Date.now
    },
    leadStatus: {
        type : String,
        required : true
    }
})

module.exports = mongoose.model('sales order',Salesorderschema);