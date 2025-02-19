const { required } = require('joi');
const mongoose = require('mongoose');
const Headregi = new mongoose.Schema({

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
        role:{
            type:String,
            enum:["md"],
            required:true
        }

});
module.exports = mongoose.model('headregister',Headregi)