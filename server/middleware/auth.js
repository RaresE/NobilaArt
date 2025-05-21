const jwt = require("jsonwebtoken")
const { User } = require("../models")

// Middleware to authenticate user
const authenticate = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.header("Authorization")?.replace("Bearer ", "")

    if (!token) {
      return res.status(401).json({ message: "No token, authorization denied" })
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "your_jwt_secret")

    // Find user
    const user = await User.findByPk(decoded.id)

    if (!user) {
      return res.status(401).json({ message: "User not found" })
    }

    // Add user to request
    req.user = user
    next()
  } catch (err) {
    console.error("Authentication error:", err.message)
    res.status(401).json({ message: "Token is not valid" })
  }
}

// Middleware to check if user is admin
const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next()
  } else {
    res.status(403).json({ message: "Access denied. Admin role required." })
  }
}

// Middleware to check if user is client
const isClient = (req, res, next) => {
  if (req.user && req.user.role === "client") {
    next()
  } else {
    res.status(403).json({ message: "Access denied. Client role required." })
  }
}

module.exports = {
  authenticate,
  isAdmin,
  isClient,
}
