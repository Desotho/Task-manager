const express = require('express')
const Task = require('../models/tasks')
const router = new express.Router()
const auth = require('../middleware/auth')
const {to} = require('await-to-js')


//Create a new Task
router.post('/tasks',auth,async(req,res) => {
    // const task = new Task(req.body)
    const task = new Task({
        ...req.body,
        owner: req.user._id//Linking created task to current user
    })
    const[e] = await to(task.save())
    if(e) {
        return res.status(400).send(e)
    }
    res.status(201).send(task)
})

//Get Tasks
//limit skip
//Get /tasks?sortBy=createdAt:desc
router.get('/tasks', auth, async(req,res) => {
    const match = {}
    const sort = {}
    
    if (req.query.completed) {
        match.completed = req.query.completed === 'true'
    }

    if (req.query.soryBy) {
        const parts = req.query.sortBy.split(':')
        sort[parts[0]] = parts[1] === 'desc'? -1:1
    }
    const [e,tasks] = await to(req.user.populate({
        path:'tasks',
        match,
        options: {
            limit:parseInt(req.query.limit),
            skip:parseInt(req.query.skip),
            sort
        }
    }).execPopulate())
    if(!tasks) {
        return res.status(500).send('You have no tasks')
    }
    if (e){
        return res.status(500).send(e)
    }
    res.status(201).send(req.user.tasks)
    
})

//Find a Task by id
router.get('/task/:id',auth ,async(req,res) => {
    const _id = req.params.id

    const[e,task] = await to(Task.find({_id, owner: req.user._id}))
    if(e){
        return res.status(400).send(e)
    }
    res.status(201).send(task)
    
})

//Update Task by ID
router.patch('/tasks/:id',auth ,async(req,res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['description','completed']
    const isValidOperation = updates.every((update)=> allowedUpdates.includes(update))

    if(!isValidOperation) {
        return res.status(400).send({error:'Invalid Updates'})
    }

    try{
        const task = await Task.findOne({ _id: req.params.id, owner: req.user._id})

        if(!task) {
            return res.status(404).send()
        }

        updates.forEach((update) => task[update] = req.body[update])
        
        await task.save()
        res.send(task)
    }catch (e) {
        res.status(400).send(e)
    }
})

//Delete Task by ID
router.delete('/tasks/:id',auth ,async(req,res)=> {
    const[e,task] = await to(Task.findOneAndDelete({_id:req.params.id, owner: req.user._id}))
    if(e) {
        return res.status(500).send(e)
    }
    if(!task) {
        return res.status(404).send()
    }
    res.status(201).send(task + 'Deleted')
})


module.exports = router