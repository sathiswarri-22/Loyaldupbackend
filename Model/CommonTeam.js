const mongoose = require ('mongoose');
const CommonTeam = new mongoose.Schema({
    
    Eid:{
       type:String,
       required:true
    },
    profileimg:{
          type:String,
    },
    JOD:{
        type:Date,
    },
    name:{
       type:String,
       required:true
    },
    email:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    address:{
        type:String,
        
    },
    Currentsalary:{
        type:Number,
    },
    Fileupload:{
       type:String,
       required:true,
    },
    CompanyResources:[
        {
        Thingsname: {
            type: String,  
          },
        productnumber:{
            type: String, 
        },
        givenStatus:{
            type: String, 
            enum:["provided","handover","bending","nothandover"],
        },
    }
    ],
    Remarks:{
        type:String
    },
    contactnumber:{
         type:String,
        required:true
    },
    role:{
        type:String,
        enum:["sales head","Engineer","Service Engineer","Sales Employee","Inventory Manager","Lead filler","Stock Filler"],
        required:true
    },
    EOD:{
        type:Date,
    },
   
   
},{timestamps:true});
module.exports = mongoose.model('Alluserprofile',CommonTeam);

