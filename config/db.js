const mongoose = require('mongoose')
const colors = require('colors')

const connectiondb = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URL)
        console.log(`Mongo Database conntected: ${mongoose.connection.host}`.bgBlue.white)

    } catch (error) {
        console.log(`Mongodb Connection error is: ${error}`.bgRed.white)
    }
}
module.exports = connectiondb;