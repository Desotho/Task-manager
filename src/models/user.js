const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const Task = require('./tasks')


const userSchema = new mongoose.Schema({
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
        unique:true, 
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
        
    },
    avatar:{
        type: Buffer
    },
    tokens:[{
        token:{
            type:String,
            required:true
        }
    }],
},{    
    timestamps:true
})
userSchema.virtual('tasks', {
    ref: 'Task',
    localField:'_id',
    foreignField:'owner'
})

userSchema.methods.toJSON = function() {
    const user = this
    const userObject = user.toObject()
    
    delete userObject.password
    delete userObject.tokens
    delete userObject.__v
    delete userObject._id
    delete userObject.avatar
    return userObject
}

userSchema.methods.generateAuthToken = async function () {   
    const user = this
    const token = jwt.sign({_id:user._id.toString()},process.env.JWT)
    
    user.tokens = user.tokens.concat({token})
    await user.save()

    return token
    
}
//verify email with password
userSchema.statics.findByCredentials = async(email,password) => {
    const user = await User.findOne({email})
    if(!user) {
        throw new Error('unable to login')
    }

    const isMatch = await bcrypt.compare(password,user.password)

    if(!isMatch) {
        throw new Error('unable to login')
    }

    return user
}
//hash the plain text password before saving
userSchema.pre('save', async function (next) {
    const user = this

    if(user.isModified('password')) {
        user.password = await bcrypt.hash(user.password , 8)
    }

    next()
})

userSchema.pre('remove',async function (next) {
    const user = this
    await Task.deleteMany({ owner: user._id })
    next()
})

const User = mongoose.model('User',userSchema)




module.exports = User