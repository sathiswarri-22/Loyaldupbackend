const mongoose = require('mongoose');
const ServiceEngineer = new mongoose.Schema({
    
    Employeeid:{
         type:String,
         required:true
    },
    name:{
        type:String,
        required:true
    },
    email:{
       type:String,
       required:true
    },
    Description:{
        type:String,
    },
    File:{
        type:String,
        required:true
    },
    Eid:{
        type:String,
        required:true
    },
    role:{
        type:String,
        required:true
    },
    Status:{
       type:String,
       required:true
        
    }
    
});
module.exports = mongoose.model('visitenquiry',ServiceEngineer);