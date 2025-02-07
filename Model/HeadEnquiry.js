const mongoose = require ('mongoose');
const HeadEnquiry = new mongoose.Schema({
EnquiryNo:{
  type:String,
  required:true
},
LeadDetails: {
    clientName: {
        type: String,
        required: true
    },
    Leadcondition:{
        type:String,
            enum:['new','existing'],
            required:true
    },
    companyName: {
        type: String,
        required: true
    },
    Department: {
        type: String,
        required: true
    },
    LeadMedium: {
        type: String,
        required: true
    },
    LeadPriority: {
        type: String,
        required: true
    },
    
    FollowUpOn: {
        type: Date
    },
    LostReason: {
        type: String   
    },
    FollowUpTime: {
        type: String
    },
    
    EnquiryType: { 
        type: String,
        required: true,
        enum: ['Product', 'Project', 'Service'], 
         
    }
},

ContactDetails: {
    MobileNumber: {
        type: String,
        required: true
    },
    AlternateMobileNumber: {
        type: String
    },
    PrimaryMail: {
        type: String,
        required: true
    },
    SecondaryMail: {
        type: String
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

DescriptionDetails: {
    
        type: String,
        required: true
    
},


Status:{
    type:String,
    required:true 
},
Eid:{
  type:String,
},
createdBy:{
  type:String,
 
}
},{timestamps:true})
module.exports=mongoose.model('enquirie',HeadEnquiry)
