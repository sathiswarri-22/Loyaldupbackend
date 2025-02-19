const mongoose = require('mongoose');

const Customerconverstion = new mongoose.Schema({
    CustomerId:{
        type:String,
        
      },
    PANnumber:{
        type:String,
        
      },
      GSTNnumber:{
        type: String,
        
    },
    companyName: {
            type: String,
            required: true
        },
    AddressDetails: {
        Address: {
            type: String,
            
        },
        Country: {
            type: String,
           
        },
        City: {
            type: String,
            
        },
        PostalCode: {
            type: String,
            
        },
        State: {
            type: String,
           
        }
    },
    customerconvert:[{
    EnquiryNo:{
        type:String,
        required:true
      },
    clientName: {
                type: String,
                required: true
            },
    CustomerDetails:{
  MobileNumber: {
    type: String,
    
},
opportunitynumber:{
    type: String,
    
},
PrimaryMail: {
    type: String,
    
},
},

BillingAddressDetails: {
    BillingAddress: {
        type: String,
        
    },
    BillingCountry: {
        type: String,
        
    },
    BillingCity: {
        type: String,
        
    },
    BillingPostalCode: {
        type: String,
        
    },
    BillingState: {
        type: String,
        
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
required: true
},

Status:{
    type: String,
    required: true
}
}]

});
module.exports = mongoose.model('customconvert',Customerconverstion);