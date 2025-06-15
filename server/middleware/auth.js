const jwt = require("jsonwebtoken")
const { User } = require("../models")

const authenticate = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "")

    if (!token) {
      return res.status(401).json({ message: "No token, authorization denied" })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "your_jwt_secret")

    const user = await User.findByPk(decoded.id)

    if (!user) {
      return res.status(401).json({ message: "User not found" })
    }

    req.user = user
    next()
  } catch (err) {
    console.error("Authentication error:", err.message)
    res.status(401).json({ message: "Token is not valid" })
  }
}

const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next()
  } else {
    res.status(403).json({ message: "Access denied. Admin role required." })
  }
}

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
