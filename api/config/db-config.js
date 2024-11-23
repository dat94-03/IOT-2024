const mongoose = require('mongoose');

const connectDb = (url) => {
    var ret=mongoose.connect(url)
    if(ret) console.log("mongo connected")
    return ret;
    
}

module.exports = connectDb;