const jwt = require('jsonwebtoken')
const User = require('../models/user')
const {to} = require('await-to-js')
const {verify} = require('../utils/index')
const auth = async(req,res,next) => {
    
    const token = req.header('Authorization').replace('Bearer ', '')
    
    const [e,decoded] = await to(verify(token))
    if(e) {
        return res.status(401).send(e)
    }
    
    const [etwo,user] = await to(User.findOne({_id: decoded._id,'tokens.token':token}))
   
    if(etwo) {
        return res.status(401).send(etwo)
    }
   

    if(!user) {
        return res.status(401).send({error: 'Please authenticate.'})
    }
    req.token = token
    req.user = user
    next()  

        
   
} 

module.exports = auth
