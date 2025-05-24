"use client"

import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../../contexts/AuthContext"

const Cart = () => {
  const { cart, updateCartItem, removeFromCart, clearCart } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const navigate = useNavigate()

  // Calculate subtotal
  const subtotal = cart.reduce((total, item) => {
    return total + item.product.price * item.quantity
  }, 0)

  // Calculate shipping (example: flat rate of $10)
  const shipping = 10

  // Calculate total
  const total = subtotal + shipping

  const handleQuantityChange = async (cartItemId, newQuantity) => {
    if (newQuantity < 1) return

    setLoading(true)
    setError("")

    try {
      const result = await updateCartItem(cartItemId, newQuantity)

      if (!result.success) {
        setError(result.message || "Failed to update quantity")
      }
    } catch (err) {
      console.error("Error updating cart item:", err)
      setError("An error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveItem = async (cartItemId) => {
    setLoading(true)
    setError("")

    try {
      const result = await removeFromCart(cartItemId)

      if (!result.success) {
        setError(result.message || "Failed to remove item")
      }
    } catch (err) {
      console.error("Error removing cart item:", err)
      setError("An error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleClearCart = async () => {
    if (window.confirm("Are you sure you want to clear your cart?")) {
      setLoading(true)
      setError("")

      try {
        const result = await clearCart()

        if (!result.success) {
          setError(result.message || "Failed to clear cart")
        }
      } catch (err) {
        console.error("Error clearing cart:", err)
        setError("An error occurred. Please try again.")
      } finally {
        setLoading(false)
      }
    }
  }

  const handleCheckout = () => {
    navigate("/checkout")
  }

  if (cart.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Coșul tău</h1>
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <p className="text-lg text-gray-600 mb-4">Coșul tău este gol</p>
          <Link
            to="/products"
            className="inline-block bg-blue-600 hover:bg-blue-700 py-2 px-6 rounded-md text-white font-medium transition duration-300"
          >
            Continuă cumpărăturile
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Coșul tău</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Cart Items */}
        <div className="md:col-span-2">
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <ul className="divide-y divide-gray-200">
              {cart.map((item) => (
                <li key={item.id} className="p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row">
                    {/* Product Image */}
                    <div className="flex-shrink-0 sm:w-24 sm:h-24 mb-4 sm:mb-0">
                      <img
                        src={item.product.imageUrl || `https://via.placeholder.com/96?text=${item.product.name}`}
                        alt={item.product.name}
                        className="w-full h-full object-cover rounded-md"
                      />
                    </div>

                    {/* Product Details */}
                    <div className="flex-1 sm:ml-6">
                      <div className="flex justify-between">
                        <div>
                          <h3 className="text-lg font-medium text-gray-900">
                            <Link to={`/products/${item.product.id}`} className="hover:text-blue-600">
                              {item.product.name}
                            </Link>
                          </h3>
                          <p className="mt-1 text-sm text-gray-500">{item.product.category}</p>

                          {/* Customizations */}
                          {item.customizations && (
                            <div className="mt-2 text-sm text-gray-700">
                              {item.customizations.color && <p>Culoare: {item.customizations.color}</p>}
                              {item.customizations.material && <p>Material: {item.customizations.materialName}</p>}
                            </div>
                          )}
                        </div>
                        <p className="text-lg font-medium text-gray-900">
                          {(item.product.price * item.quantity).toFixed(2).replace('.', ',')} lei
                        </p>
                      </div>

                      <div className="mt-4 flex justify-between items-center">
                        {/* Quantity Controls */}
                        <div className="flex items-center">
                          <button
                            type="button"
                            disabled={loading}
                            onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                            className="p-1 rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <svg
                              className="h-5 w-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4"></path>
                            </svg>
                          </button>
                          <span className="mx-2 text-gray-700">{item.quantity}</span>
                          <button
                            type="button"
                            disabled={loading}
                            onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                            className="p-1 rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <svg
                              className="h-5 w-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                              ></path>
                            </svg>
                          </button>
                        </div>

                        {/* Remove Button */}
                        <button
                          type="button"
                          disabled={loading}
                          onClick={() => handleRemoveItem(item.id)}
                          className="text-sm font-medium text-red-600 hover:text-red-500"
                        >
                          Șterge
                        </button>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <div className="p-4 sm:p-6 border-t border-gray-200">
              <button
                type="button"
                onClick={handleClearCart}
                disabled={loading}
                className="text-sm font-medium text-red-600 hover:text-red-500"
              >
                Golește coșul
              </button>
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="md:col-span-1">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Sumar comandă</h2>

            <div className="space-y-4">
              <div className="flex justify-between">
                <p className="text-gray-600">Subtotal</p>
                <p className="text-gray-900 font-medium">{(subtotal.toFixed(2).replace('.', ',')).replace('.', ',')} lei</p>
              </div>

              <div className="flex justify-between">
                <p className="text-gray-600">Transport</p>
                <p className="text-gray-900 font-medium">{(shipping.toFixed(2).replace('.', ',')).replace('.', ',')} lei</p>
              </div>

              <div className="border-t border-gray-200 pt-4 flex justify-between">
                <p className="text-lg font-medium text-gray-900">Total</p>
                <p className="text-lg font-bold text-gray-900">{(total.toFixed(2).replace('.', ',')).replace('.', ',')} lei</p>
              </div>
            </div>

            <div className="mt-6">
              <button
                type="button"
                onClick={handleCheckout}
                disabled={loading}
                className={`w-full py-3 px-4 rounded-md text-white font-medium ${
                  loading ? "bg-blue-400" : "bg-blue-600 hover:bg-blue-700"
                } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
              >
                Mergi la finalizare comandă
              </button>
            </div>

            <div className="mt-4">
              <Link to="/products" className="text-sm font-medium text-blue-600 hover:text-blue-500">
                Continuă cumpărăturile
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Cart
