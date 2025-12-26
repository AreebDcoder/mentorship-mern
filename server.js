const express = require("express");
const colors = require("colors");
const morgan = require("morgan");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");

//dotenv conig
dotenv.config();

//mongodb connection
connectDB();

//rest obejct
const app = express();

// Increase payload size limit for base64 images
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

//middlewares
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

//routes
app.use("/api/v1/user", require("./routes/userRoutes"));
app.use("/api/v1/admin", require("./routes/adminRoutes"));

// Root route handler
app.get("/", (req, res) => {
    res.status(200).json({
        message: "SkillConnect API Server is running!",
        status: "success",
        endpoints: {
            user: "/api/v1/user",
            admin: "/api/v1/admin"
        },
        note: "This is the backend API server. Access the frontend at http://localhost:3000"
    });
});

// Debug: Log registered routes
console.log("Admin routes loaded");

//port
const port = process.env.PORT || 8080;
//listen port
app.listen(port, () => {
    console.log(
        `Server Running in ${process.env.NODE_ENV || "development"} Mode on port ${process.env.PORT || port}`
            .bgCyan.white
    );
});