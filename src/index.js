const express = require('express')
require('./db/mongoose')
const User = require('./models/user')
const app = express()
const port = process.env.PORT || 3000
const Task = require('./models/tasks')
const {to} = require('await-to-js')

app.use(express.json())
//Create a new User
app.post('/users',async(req,res)=>{
    const user = new User(req.body)

    const[e] = await to(user.save())
    if(e) {
        res.status(400).send(e)
        return
    }
    res.status(201).send(user)
})
//Print all Users
app.get('/users',async(req,res)=>{
    const [e, users] = await to(User.find({}))
    if(e) {
        res.status(400).send(e)
        return
    }
    res.status(201).send(users)
})
//Find a User by id
app.get('/users/:id',async(req,res)=>{
    const _id = req.params.id

    const [e,user] = await to(User.findById({_id}))
    if(e) {
        res.status(400).send(e)
        return
    }
    res.status(201).send(user)
})
//Create a new Task
app.post('/tasks',async(req,res)=> {
    const task = new Task(req.body)
    try{
        await task.save()
        res.status(201).send(task)
    }catch(e){
        res.status(400).send(e)
    }
})

//Print all Tasks
app.get('/tasks',async(req,res)=> {
    try{
        const task = await Task.find({})
        res.status(201).send(task)
    }catch(e) {
        res.status(400).send(e)
    }
})
//Find a Task by id
app.get('/tasks/:id',async(req,res)=>{
    const _id = req.params.id
    try{
        const task = await Task.findById({_id})
        res.status(201).send(task)
    }catch(e) {
        res.status(400).send(e)
    }
})
app.listen(port, ()=> {
    console.log(port)
})