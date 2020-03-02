require('../src/db/mongoose')
const User = require('../src/models/user')

// User.findByIdAndUpdate('5e5cfa591e4abd378cd38bb0', {age: 23}).then((user) => {
//     console.log(user)
//     return User.countDocuments({age:22})
// }).then((result)=>{
//     console.log(result)
// }).catch((e)=>{
// console.log(e)
// })

const updateAgeAndCount = async (id,age) => {
    const user = await User.findByIdAndUpdate(id, { age })
    const count = await User.countDocuments({ age })
    return count, user
}

updateAgeAndCount('5e5cfa591e4abd378cd38bb0',22).then((count) =>{
    console.log(count)
}).catch((e)=> {
    console.log(e)
})