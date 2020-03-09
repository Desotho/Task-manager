const express = require('express')
const router = new express.Router()
const {to} = require('await-to-js')
const multer = require('multer')
const shart = require('sharp')
const auth = require('../middleware/auth')
const {sendWelcomeEmail,sendCancelEmail} = require('../email/account')
const User = require('../models/user')
const emailapi = process.env.EMAILKEY

//Create a new User 
router.post('/users',async(req,res) => {
    const user = new User(req.body)

    const[e] = await to(user.save())
    sendWelcomeEmail(user.email, user.name)
    if(e) {
        return res.status(400).send(e)
    }
    const token = await user.generateAuthToken()
    return res.status(201).send({user,token})
})
//Logs a User in
router.post('/users/login',async (req,res) => {
    const [e,user] = await to(User.findByCredentials(req.body.email, req.body.password))
    if(e) {
        return res.status(400).send(e)
    }
    const token = await user.generateAuthToken()
    res.status(200).send({user,token})
})
//Logout a User
router.post('/users/logout',auth ,async(req,res)=> {
    req.user.tokens = req.user.tokens.filter((token)=> {
      return token.token !== req.token  

    })
    await req.user.save()

    res.send('logged out')
}) 
//log's all users out
router.post('/users/logoutALL', auth ,async(req,res) => {
    req.user.tokens = []
    await req.user.save()        
    res.send('Success')
})

//shows the user
router.get('/users/me',auth ,async(req,res) => { 
    res.send(req.user)
})

//Update User by ID
router.patch('/users/me',auth, async(req,res) => {
    const body = req.body
    const updates = Object.keys(body)
    const allowedUpdates = ['name','email', 'age', 'password']
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

    if(!isValidOperation) {
        return res.status(400).send({error:'Invalid updates'})
    }
    
    try{
        updates.forEach((update) => req.user[update] = req.body[update])
        await req.user.save()
        res.send(req.user)
    }catch (e) {
        res.status(400).send(e)
    }
})

//Deleting User that's logged in
router.delete('/users/me',auth ,async(req,res)=> {
    const _id = req.user._id
    const[e,user] = await to(req.user.remove())
    sendCancelEmail(req.user.email, req.user.name)
    if(e) {
        return res.status(500).send(e)
    }
    // if(!user) {
    //     return res.status(404).send()
    // }
    return res.send(req.user +' Deleted')
})

const upload = multer({
    limits: {
        fileSize: 1000000
    },
    fileFilter(req, file, cb)  {
       if(!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
           return cb(new Error('please upload JPG,JPEG or PNG'))
       }
       cb(undefined, true)
    }
    
})

router.post('/users/me/avatar', auth, upload.single('upload'), async (req, res) => {
    const buffer = await sharp(req.file.buffer).resize({ width: 250, height: 250}).png().toBuffer()
    req.user.avatar = buffer
    await req.user.save()
    res.status(200).send()
}, (error, req, res, next) =>{
    res.status(400).send({error:error.message})
})

router.delete('/users/me/avatar', auth, async(req, res) => {
    req.user.avatar = undefined
    await req.user.save()
    res.send('removed')
})

router.get('/users/:id/avatar', async(req,res) => {
    const[e,user] = await to(User.findById(req.params.id))
    if(e) {
        res.status(404).send(e)
    }
    if(!user || !user.avatar) {
        throw new Error()
    }
    res.set('Content-Type', 'image/png')
    res.send(user.avatar)
})

module.exports = router

