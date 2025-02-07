const mongoose = require('mongoose');

const Customerconverstion = new mongoose.Schema({
  
    EnquiryNo:{
        type:String,
        required:true
      },
    CustomerDetails:{
  PANnumber:{
    type:String,
    required:true
  },
  MobileNumber: {
    type: String,
    required: true
},
opportunitynumber:{
    type: String,
    required: true
},
GSTNnumber:{
    type: String,
    required: true
},
PrimaryMail: {
    type: String,
    required: true
},
},
AddressDetails: {
    Address: {
        type: String,
        required: true
    },
    Country: {
        type: String,
        required: true
    },
    City: {
        type: String,
        required: true
    },
    PostalCode: {
        type: String,
        required: true
    },
    State: {
        type: String,
        required: true
    }
},
BillingAddressDetails: {
    BillingAddress: {
        type: String,
        required: true
    },
    BillingCountry: {
        type: String,
        required: true
    },
    BillingCity: {
        type: String,
        required: true
    },
    BillingPostalCode: {
        type: String,
        required: true
    },
    BillingState: {
        type: String,
        required: true
    }
},
DescriptionDetails: {
        type: String,
},
Convertedstatus:{
 type:String,
 enum:['yes','no'],
 required:true
},
Eid:{
type:String,
required:true
},
Status:{
    type: String,
    required: true
}



})
module.exports = mongoose.model('customerconvert',Customerconverstion)