"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import axios from "axios"

const Orders = () => {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/orders")
        setOrders(response.data)
      } catch (err) {
        console.error("Error fetching orders:", err)
        setError("Failed to load orders. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    fetchOrders()
  }, [])

  // Helper function to format date
  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "long", day: "numeric" }
    return new Date(dateString).toLocaleDateString(undefined, options)
  }

  // Helper function to get status badge color
  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "processing":
        return "bg-blue-100 text-blue-800"
      case "shipped":
        return "bg-purple-100 text-purple-800"
      case "delivered":
        return "bg-green-100 text-green-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">My Orders</h1>

      {orders.length === 0 ? (
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <p className="text-lg text-gray-600 mb-4">You haven't placed any orders yet</p>
          <Link
            to="/products"
            className="inline-block bg-blue-600 hover:bg-blue-700 py-2 px-6 rounded-md text-white font-medium transition duration-300"
          >
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {orders.map((order) => (
              <li key={order.id}>
                <Link to={`/orders/${order.id}`} className="block hover:bg-gray-50">
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col sm:flex-row sm:items-center">
                        <p className="text-sm font-medium text-blue-600 truncate">Order #{order.id}</p>
                        <p className="sm:ml-2 flex-shrink-0 font-normal text-gray-500 sm:mt-0 mt-1">
                          Placed on {formatDate(order.createdAt)}
                        </p>
                      </div>
                      <div className="ml-2 flex-shrink-0 flex">
                        <p
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(order.status)}`}
                        >
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </p>
                      </div>
                    </div>
                    <div className="mt-2 sm:flex sm:justify-between">
                      <div className="sm:flex">
                        <p className="flex items-center text-sm text-gray-500">
                          {order.items.length} {order.items.length === 1 ? "item" : "items"}
                        </p>
                      </div>
                      <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                        <p>
                          Total: <span className="font-medium text-gray-900">${order.total.toFixed(2)}</span>
                        </p>
                      </div>
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

export default Orders
