const mongoose = require('mongoose');
const Productrequest = new mongoose.Schema({
    Eid:{
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
 companyname:{
    type:String,
    required:true
 },  
 contactpersonname:{
   type:String,
   required:true
 },
 quantity:{
    type:Number,
    
 },
 productname:{
    type:String,
    required:true
 },
 Description:{
    type:String
 },
 Employeeid:{
   type:String,
   required:true
 },
 Status:{
   type:String,
   required:true
 }

})
module.exports = mongoose.model('productrequest',Productrequest);