const express = require('express')
const cors = require('cors')
const colors = require('colors')
const morgan = require('morgan')
const dotenv = require('dotenv')
const connectiondb = require('./config/db')
const app = express()

dotenv.config()
connectiondb()

// Middleware
app.use(express.json())
app.use(morgan('dev'))

// CORS middleware
app.use(cors({
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}))

// Routes
app.use("/api/v1/user", require("./routes/userRoutes"))

const port = process.env.PORT || 8080
app.listen(port, () => {
    console.log(`Server running in ${process.env.NODE_MODE} mode on port ${port}`.bgCyan.white)
})
