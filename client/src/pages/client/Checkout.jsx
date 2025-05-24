"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../../contexts/AuthContext"
import axios from "axios"

const Checkout = () => {
  const { user, cart, clearCart } = useAuth()
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    address: user?.address || "",
    city: "",
    state: "",
    zipCode: "",
    phone: user?.phone || "",
    paymentMethod: "credit_card",
    cardNumber: "",
    cardExpiry: "",
    cardCvc: "",
    deliveryMethod: "standard",
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [orderId, setOrderId] = useState(null)

  // Calculate subtotal
  const subtotal = cart.reduce((total, item) => {
    return total + item.product.price * item.quantity
  }, 0)

  // Calculate shipping based on delivery method
  const getShippingCost = () => {
    switch (formData.deliveryMethod) {
      case "express":
        return 20
      case "next_day":
        return 30
      case "standard":
      default:
        return 10
    }
  }

  const shipping = getShippingCost()

  // Calculate total
  const total = subtotal + shipping

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccess(false)
    setOrderId(null)

    try {
      // Create order
      const orderData = {
        items: cart.map((item) => ({
          productId: item.product.id,
          quantity: item.quantity,
          customizations: item.customizations,
        })),
        shippingAddress: {
          name: formData.name,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode,
          phone: formData.phone,
        },
        paymentMethod: formData.paymentMethod,
        deliveryMethod: formData.deliveryMethod,
        subtotal,
        shipping,
        total,
      }

      console.log('Order data trimis la backend:', orderData)

      const response = await axios.post("http://localhost:5000/api/orders", orderData)

      setSuccess(true)
      setOrderId(response.data.id)
      await clearCart()
    } catch (err) {
      console.error("Error creating order:", err)
      setError(err.response?.data?.message || "Failed to place order. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (cart.length === 0) {
      navigate("/cart")
    }
  }, [cart, navigate])

  if (cart.length === 0) {
    return null
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Checkout</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">
          Comanda a fost finalizată cu succes!
          {orderId && (
            <span>
              Vezi detalii <a href={`/orders/${orderId}`} className="text-blue-600 underline">aici</a>.
            </span>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Shipping and Payment Information */}
        <div>
          {/* Shipping Information */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Shipping Information</h2>

            <div className="grid grid-cols-1 gap-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
              </div>

              <div>
                <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                  Street Address
                </label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="city" className="block text-sm font-medium text-gray-700">
                    City
                  </label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                </div>

                <div>
                  <label htmlFor="state" className="block text-sm font-medium text-gray-700">
                    State / Province
                  </label>
                  <input
                    type="text"
                    id="state"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700">
                    ZIP / Postal Code
                  </label>
                  <input
                    type="text"
                    id="zipCode"
                    name="zipCode"
                    value={formData.zipCode}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Delivery Method */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Delivery Method</h2>

            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  id="delivery-standard"
                  name="deliveryMethod"
                  type="radio"
                  value="standard"
                  checked={formData.deliveryMethod === "standard"}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                />
                <label htmlFor="delivery-standard" className="ml-3 block text-sm font-medium text-gray-700">
                  Livrare standard (3-5 zile lucrătoare) - 50 lei
                </label>
              </div>

              <div className="flex items-center">
                <input
                  id="delivery-express"
                  name="deliveryMethod"
                  type="radio"
                  value="express"
                  checked={formData.deliveryMethod === "express"}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                />
                <label htmlFor="delivery-express" className="ml-3 block text-sm font-medium text-gray-700">
                  Livrare expres (2-3 zile lucrătoare) - 100 lei
                </label>
              </div>

              <div className="flex items-center">
                <input
                  id="delivery-next-day"
                  name="deliveryMethod"
                  type="radio"
                  value="next_day"
                  checked={formData.deliveryMethod === "next_day"}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                />
                <label htmlFor="delivery-next-day" className="ml-3 block text-sm font-medium text-gray-700">
                  Livrare în următoarea zi (1 zi lucrătoare) - 150 lei
                </label>
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Payment Method</h2>

            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  id="payment-credit-card"
                  name="paymentMethod"
                  type="radio"
                  value="credit_card"
                  checked={formData.paymentMethod === "credit_card"}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                />
                <label htmlFor="payment-credit-card" className="ml-3 block text-sm font-medium text-gray-700">
                  Credit Card
                </label>
              </div>

              <div className="flex items-center">
                <input
                  id="payment-paypal"
                  name="paymentMethod"
                  type="radio"
                  value="paypal"
                  checked={formData.paymentMethod === "paypal"}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                />
                <label htmlFor="payment-paypal" className="ml-3 block text-sm font-medium text-gray-700">
                  PayPal
                </label>
              </div>

              <div className="flex items-center">
                <input
                  id="payment-bank-transfer"
                  name="paymentMethod"
                  type="radio"
                  value="bank_transfer"
                  checked={formData.paymentMethod === "bank_transfer"}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                />
                <label htmlFor="payment-bank-transfer" className="ml-3 block text-sm font-medium text-gray-700">
                  Bank Transfer
                </label>
              </div>
            </div>

            {formData.paymentMethod === "credit_card" && (
              <div className="mt-4 space-y-4">
                <div>
                  <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700">
                    Card Number
                  </label>
                  <input
                    type="text"
                    id="cardNumber"
                    name="cardNumber"
                    value={formData.cardNumber}
                    onChange={handleChange}
                    placeholder="1234 5678 9012 3456"
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="cardExpiry" className="block text-sm font-medium text-gray-700">
                      Expiration Date
                    </label>
                    <input
                      type="text"
                      id="cardExpiry"
                      name="cardExpiry"
                      value={formData.cardExpiry}
                      onChange={handleChange}
                      placeholder="MM/YY"
                      required
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    />
                  </div>

                  <div>
                    <label htmlFor="cardCvc" className="block text-sm font-medium text-gray-700">
                      CVC
                    </label>
                    <input
                      type="text"
                      id="cardCvc"
                      name="cardCvc"
                      value={formData.cardCvc}
                      onChange={handleChange}
                      placeholder="123"
                      required
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Order Summary */}
        <div>
          <div className="bg-white rounded-lg shadow p-6 sticky top-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Order Summary</h2>

            <div className="max-h-96 overflow-y-auto mb-4">
              <ul className="divide-y divide-gray-200">
                {cart.map((item) => (
                  <li key={item.id} className="py-4 flex">
                    <div className="flex-shrink-0 w-16 h-16">
                      <img
                        src={item.product.imageUrl || `https://via.placeholder.com/64?text=${item.product.name}`}
                        alt={item.product.name}
                        className="w-full h-full object-cover rounded-md"
                      />
                    </div>
                    <div className="ml-4 flex-1">
                      <div className="flex justify-between">
                        <h3 className="text-sm font-medium text-gray-900">{item.product.name}</h3>
                        <p className="text-sm font-medium text-gray-900">
                          ${(item.product.price * item.quantity).toFixed(2).replace('.', ',')} lei
                        </p>
                      </div>
                      <p className="mt-1 text-sm text-gray-500">Qty: {item.quantity}</p>

                      {/* Customizations */}
                      {item.customizations && (
                        <div className="mt-1 text-xs text-gray-500">
                          {item.customizations.color && <p>Color: {item.customizations.color}</p>}
                          {item.customizations.material && <p>Material: {item.customizations.materialName}</p>}
                        </div>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between">
                <p className="text-gray-600">Subtotal</p>
                <p className="text-gray-900 font-medium">{subtotal.toFixed(2).replace('.', ',')} lei</p>
              </div>

              <div className="flex justify-between">
                <p className="text-gray-600">Transport</p>
                <p className="text-gray-900 font-medium">{shipping.toFixed(2).replace('.', ',')} lei</p>
              </div>

              <div className="border-t border-gray-200 pt-4 flex justify-between">
                <p className="text-lg font-medium text-gray-900">Total</p>
                <p className="text-lg font-bold text-gray-900">{total.toFixed(2).replace('.', ',')} lei</p>
              </div>
            </div>

            <div className="mt-6">
              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3 px-4 rounded-md text-white font-medium ${
                  loading ? "bg-blue-400" : "bg-blue-600 hover:bg-blue-700"
                } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
              >
                {loading ? "Processing..." : "Place Order"}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}

export default Checkout
