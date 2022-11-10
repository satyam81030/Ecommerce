const mongoose = require('mongoose')



const connectDatabase = ()=>{

mongoose.connect(process.env.DB_URI).then((data)=>{
    console.log(`Mongodb is connected with server : ${data.connection.host}`)
})
}


module.exports = connectDatabase;