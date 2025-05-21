"use client"

import { createContext, useState, useContext, useEffect } from "react"
import axios from "axios"

const AuthContext = createContext()

export const useAuth = () => useContext(AuthContext)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [cart, setCart] = useState([])

  // Check if user is already logged in
  useEffect(() => {
    const checkLoggedIn = async () => {
      try {
        const token = localStorage.getItem("token")
        if (token) {
          axios.defaults.headers.common["Authorization"] = `Bearer ${token}`
          const response = await axios.get("http://localhost:5000/api/auth/me")
          setUser(response.data)

          // If user is logged in, fetch their cart
          if (response.data && response.data.role === "client") {
            const cartResponse = await axios.get("http://localhost:5000/api/cart")
            setCart(cartResponse.data)
          }
        }
      } catch (error) {
        localStorage.removeItem("token")
        delete axios.defaults.headers.common["Authorization"]
      } finally {
        setLoading(false)
      }
    }

    checkLoggedIn()
  }, [])

  // Login function
  const login = async (email, password, isAdmin = false) => {
    try {
      const endpoint = isAdmin ? "/api/auth/admin/login" : "/api/auth/login"
      const response = await axios.post(`http://localhost:5000${endpoint}`, { email, password })
      const { token, user } = response.data

      localStorage.setItem("token", token)
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`
      setUser(user)

      // If client, fetch cart
      if (user.role === "client") {
        const cartResponse = await axios.get("http://localhost:5000/api/cart")
        setCart(cartResponse.data)
      }

      return { success: true }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Login failed",
      }
    }
  }

  // Register function
  const register = async (userData) => {
    try {
      const response = await axios.post("http://localhost:5000/api/auth/register", userData)
      const { token, user } = response.data

      localStorage.setItem("token", token)
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`
      setUser(user)

      return { success: true }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Registration failed",
      }
    }
  }

  // Logout function
  const logout = () => {
    localStorage.removeItem("token")
    delete axios.defaults.headers.common["Authorization"]
    setUser(null)
    setCart([])
  }

  // Add to cart function
  const addToCart = async (productId, quantity, customizations = {}) => {
    try {
      console.log('Adding to cart:', { productId, quantity, customizations });
      const response = await axios.post("http://localhost:5000/api/cart", {
        productId,
        quantity,
        customizations,
      })
      console.log('Cart response:', response.data);
      setCart(response.data)
      return { success: true }
    } catch (error) {
      console.error('Add to cart error:', error.response?.data || error);
      return {
        success: false,
        message: error.response?.data?.message || "Failed to add to cart",
      }
    }
  }

  // Update cart item function
  const updateCartItem = async (cartItemId, quantity) => {
    try {
      const response = await axios.put(`http://localhost:5000/api/cart/${cartItemId}`, {
        quantity,
      })
      setCart(response.data)
      return { success: true }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to update cart",
      }
    }
  }

  // Remove from cart function
  const removeFromCart = async (cartItemId) => {
    try {
      const response = await axios.delete(`http://localhost:5000/api/cart/${cartItemId}`)
      setCart(response.data)
      return { success: true }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to remove from cart",
      }
    }
  }

  // Clear cart function
  const clearCart = async () => {
    try {
      await axios.delete("http://localhost:5000/api/cart")
      setCart([])
      return { success: true }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to clear cart",
      }
    }
  }

  const value = {
    user,
    loading,
    cart,
    login,
    register,
    logout,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
