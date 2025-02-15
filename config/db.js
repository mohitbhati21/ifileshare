require('dotenv').config();
const mongoose = require('mongoose')



function connectDB() {
        //Database connection
    mongoose.connect(process.env.MONGO_CONNECTION_URL, {useCreateIndex:true, useFindAndModify:true,useNewUrlParser:true,useUnifiedTopology:true});

    const connection= mongoose.connection;


    connection.once('open', () => {
        console.log('database connected');
    }).catch(err => {
        console.log('connection failed');
    })
}

module.exports = connectDB;