const express = require("express")
const router = express.Router()
const jwt = require("jsonwebtoken")
const { User } = require("../models")
const { authenticate } = require("../middleware/auth")

router.post("/register", async (req, res) => {
  try {
    const { name, email, password, address, phone } = req.body

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } })
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" })
    }

    // Create new user
    const user = await User.create({
      name,
      email,
      password,
      address,
      phone,
      role: "client", // Default role for registration
    })

    // Generate JWT token
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET || "your_jwt_secret", { expiresIn: "7d" })

    // Return user data (without password) and token
    res.status(201).json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        address: user.address,
        phone: user.phone,
      },
    })
  } catch (err) {
    console.error("Registration error:", err)
    res.status(500).json({ message: "Server error" })
  }
})

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body

    // Find user by email
    const user = await User.findOne({ where: { email } })
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" })
    }

    // Check password
    const isMatch = await user.checkPassword(password)
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" })
    }

    // Generate JWT token
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET || "your_jwt_secret", { expiresIn: "7d" })

    // Return user data (without password) and token
    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        address: user.address,
        phone: user.phone,
      },
    })
  } catch (err) {
    console.error("Login error:", err)
    res.status(500).json({ message: "Server error" })
  }
})

router.post("/admin/login", async (req, res) => {
  try {
    const { email, password } = req.body

    // Find user by email
    const user = await User.findOne({ where: { email } })
    if (!user || user.role !== "admin") {
      return res.status(400).json({ message: "Invalid credentials" })
    }

    // TEMPORAR: Verifică dacă parola este "password123" pentru admin
    if (email === 'admin@mobilux.com' && password === 'password123') {
      // Generează token JWT
      const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET || "your_jwt_secret", { expiresIn: "7d" })
      // Returnează datele utilizatorului și token-ul
      return res.json({
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      })
    }

    // Check password (normal)
    const isMatch = await user.checkPassword(password)
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" })
    }

    // Generate JWT token
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET || "your_jwt_secret", { expiresIn: "7d" })

    // Return user data (without password) and token
    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    })
  } catch (err) {
    console.error("Admin login error:", err)
    res.status(500).json({ message: "Server error" })
  }
})

router.get("/me", authenticate, async (req, res) => {
  try {
    // Return user data (without password)
    res.json({
      id: req.user.id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
      address: req.user.address,
      phone: req.user.phone,
    })
  } catch (err) {
    console.error("Get user error:", err)
    res.status(500).json({ message: "Server error" })
  }
})

router.put("/profile", authenticate, async (req, res) => {
  try {
    const { name, email, address, phone, password } = req.body

    // Update user
    const user = req.user

    // Check if email is being changed and if it's already in use
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ where: { email } })
      if (existingUser) {
        return res.status(400).json({ message: "Email already in use" })
      }
      user.email = email
    }

    // Update other fields
    if (name) user.name = name
    if (address) user.address = address
    if (phone) user.phone = phone
    if (password) user.password = password

    await user.save()

    // Return updated user data (without password)
    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      address: user.address,
      phone: user.phone,
    })
  } catch (err) {
    console.error("Update profile error:", err)
    res.status(500).json({ message: "Server error" })
  }
})

module.exports = router
