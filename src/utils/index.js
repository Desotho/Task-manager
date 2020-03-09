const jwt = require('jsonwebtoken')
const verify = token => {
    return new Promise((res,rej)=> {
        try{
            const decoded = jwt.verify(token,process.env.JWT)
             res(decoded)
        }catch (e) {
             rej(e)
        }
    })
}
module.exports = {
    verify
}