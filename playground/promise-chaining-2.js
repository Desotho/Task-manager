require('../src/db/mongoose')
const Task = require('../src/models/tasks')

Task.findByIdAndDelete('5e5c1d350edb433e2c00ec12').then((task)=>{
    
    return Task.countDocuments({completed:false})
}).then((tasks)=>{
    
}).catch((e)=>{
    console.log(e)
})

const deleteTaskAndCount = async (id) => {
    const task = await Task.findByIdAndDelete(id)
    const count = await Task.countDocuments
    return count
}

deleteTaskAndCount('5e5c1d89e59ad03b5cd142ad').then((count)=>{
    console.log(count)
}).catch((e)=> {
    console.log(e)
})