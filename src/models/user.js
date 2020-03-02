const mongoose = require('mongoose')
const validator = require('validator')

const User = mongoose.model('User',{
    name:{
        type:String,
        required:true,
        trim:true
    },
    age:{
        type: Number,
        default:100,
        validate(value) {
            if(value < 0){
                throw new Error('age must be a positive number')
            } 
        }
    },
    email:{
        type:String,
        required:true,
        trim:true,
        lowercase:true,
        validate(value){
            if(!validator.isEmail(value)) {
                throw new Error('Email is invalid')
            }
        }

    },
    password:{
        type:String,
        required:true,
        minlength:6,
        trim:true,
        validate(value) {
            if(value.toLowerCase().includes('password')) {
                throw new Error('password can not be "password"')
            }
        }
        
    }


})


module.exports = User