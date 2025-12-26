const mongoose = require('mongoose')
const colors = require('colors')

const connectDB = async () => {
    try {
        if (!process.env.MONGODB_URL) {
            console.log("MONGODB_URL is not defined in environment variables".bgRed.white);
            process.exit(1);
        }
        await mongoose.connect(process.env.MONGODB_URL)
        console.log(`Mongo Database conntected: ${mongoose.connection.host}`.bgBlue.white)

    } catch (error) {
        console.log(`Mongodb Connection error is: ${error}`.bgRed.white)
        process.exit(1);
    }
}
module.exports = connectDB;