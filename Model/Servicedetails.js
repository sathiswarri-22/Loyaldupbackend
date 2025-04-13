const mongoose = require('mongoose');
const Servicedetails = new mongoose.Schema({
    
    Eid:{
         type:String,
         required:true
    },
    Customerinward:{
       type:String,
       required:true
    },
    clientName:{
      type:String,
      required:true
 },
    quantity:{
        type:String,
    },
    servicestartdate:{
        type:String,
        required:true
    },
    serviceenddate:{
        type:String,
    },
    Employeeid:{
        type:String,
        required:true
    },
    Material:{
       type:String,    
    },
    Model:{
        type:String,    
     },
     SerialNo:{
        type:String,    
     },
     powerconsumption:{
        type:String,    
     },
     serviceStatus:{
        type:String,    
     },
     BillingStatus:{
        type:String,    
     }
    
});
module.exports = mongoose.model('servicedetails',Servicedetails);