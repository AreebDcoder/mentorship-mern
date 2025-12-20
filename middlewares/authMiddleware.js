const JWT = require("jsonwebtoken");

module.exports = async (req, res, next) => {
    try {
        const authHeader = req.headers["authorization"];
        if (!authHeader) {
            return res.status(401).send({
                message: "Auth Failed - No token provided",
                success: false,
            });
        }
        const token = authHeader.split(" ")[1];
        if (!token) {
            return res.status(401).send({
                message: "Auth Failed - Invalid token format",
                success: false,
            });
        }
        if (!process.env.JWT_SECRET) {
            return res.status(500).send({
                message: "Server configuration error",
                success: false,
            });
        }
        JWT.verify(token, process.env.JWT_SECRET, (err, decode) => {
            if (err) {
                return res.status(401).send({
                    message: "Auth Failed",
                    success: false,
                });
            } else {
                // Initialize req.body if it doesn't exist (for GET requests)
                if (!req.body) {
                    req.body = {};
                }
                req.body.userId = decode.id;
                // Also attach to req.user for easier access
                req.user = { id: decode.id };
                next();
            }
        });
    } catch (error) {
        console.log(error);
        res.status(401).send({
            message: "Auth Failed",
            success: false,
        });
    }
};