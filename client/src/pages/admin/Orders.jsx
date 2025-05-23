"use client"

import { useState, useEffect } from "react"
import axios from "axios"

const statusOptions = [
  { value: "pending", label: "Pending" },
  { value: "processing", label: "Processing" },
  { value: "shipped", label: "Shipped" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
]

const AdminOrders = () => {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [filters, setFilters] = useState({
    status: "",
    startDate: "",
    endDate: "",
    search: "",
  })
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  })
  const [statusEdit, setStatusEdit] = useState({})
  const [savingStatus, setSavingStatus] = useState({})
  const [statusError, setStatusError] = useState({})

  useEffect(() => {
    fetchOrders()
  }, [filters, pagination.page, pagination.limit])

  const fetchOrders = async () => {
    setLoading(true)
    try {
      // Build query string from filters and pagination
      const params = new URLSearchParams()

      if (filters.status) {
        params.append("status", filters.status)
      }

      if (filters.startDate) {
        params.append("startDate", filters.startDate)
      }

      if (filters.endDate) {
        params.append("endDate", filters.endDate)
      }

      if (filters.search) {
        params.append("search", filters.search)
      }

      params.append("page", pagination.page)
      params.append("limit", pagination.limit)

      const response = await axios.get(`http://localhost:5000/api/admin/orders?${params.toString()}`)

      setOrders(response.data.orders)
      setPagination({
        ...pagination,
        total: response.data.total,
        totalPages: response.data.totalPages,
      })
    } catch (err) {
      console.error("Error fetching orders:", err)
      setError("Failed to load orders. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (e) => {
    const { name, value } = e.target
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }))

    // Reset to first page when filters change
    setPagination((prev) => ({
      ...prev,
      page: 1,
    }))
  }

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > pagination.totalPages) return

    setPagination((prev) => ({
      ...prev,
      page: newPage,
    }))
  }

  const clearFilters = () => {
    setFilters({
      status: "",
      startDate: "",
      endDate: "",
      search: "",
    })

    setPagination((prev) => ({
      ...prev,
      page: 1,
    }))
  }

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

  const handleStatusChange = (orderId, newStatus) => {
    setStatusEdit((prev) => ({ ...prev, [orderId]: newStatus }))
  }

  const handleSaveStatus = async (orderId) => {
    setSavingStatus((prev) => ({ ...prev, [orderId]: true }))
    setStatusError((prev) => ({ ...prev, [orderId]: null }))
    try {
      await axios.put(`http://localhost:5000/api/admin/orders/${orderId}/status`, {
        status: statusEdit[orderId],
      })
      setOrders((prev) => prev.map((order) => order.id === orderId ? { ...order, status: statusEdit[orderId] } : order))
      setStatusEdit((prev) => ({ ...prev, [orderId]: undefined }))
    } catch (err) {
      setStatusError((prev) => ({ ...prev, [orderId]: "Failed to update status" }))
    } finally {
      setSavingStatus((prev) => ({ ...prev, [orderId]: false }))
    }
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Manage Orders</h1>
        <p className="mt-1 text-sm text-gray-500">View and manage all customer orders</p>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              id="status"
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div>
            <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
              Start Date
            </label>
            <input
              type="date"
              id="startDate"
              name="startDate"
              value={filters.startDate}
              onChange={handleFilterChange}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>

          <div>
            <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
              End Date
            </label>
            <input
              type="date"
              id="endDate"
              name="endDate"
              value={filters.endDate}
              onChange={handleFilterChange}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>

          <div>
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
              Search
            </label>
            <input
              type="text"
              id="search"
              name="search"
              value={filters.search}
              onChange={handleFilterChange}
              placeholder="Order ID or Customer Name"
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>
        </div>

        <div className="mt-4 flex justify-end">
          <button
            onClick={clearFilters}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Orders Table */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <p className="text-lg text-gray-600 mb-4">No orders found</p>
          <button
            onClick={clearFilters}
            className="inline-block bg-blue-600 hover:bg-blue-700 py-2 px-6 rounded-md text-white font-medium transition duration-300"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Order ID
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Customer
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Date
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Total
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Status
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {orders.map((order) => (
                <tr key={order.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order.user ? order.user.name : order.User ? order.User.name : "N/A"}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatDate(order.createdAt)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order.total ? `$${order.total.toFixed(2)}` : "-"}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(order.status)}`}>
                      {order.status ? order.status.charAt(0).toUpperCase() + order.status.slice(1) : "-"}
                    </span>
                    <div className="mt-2">
                      <select
                        value={statusEdit[order.id] !== undefined ? statusEdit[order.id] : order.status}
                        onChange={e => handleStatusChange(order.id, e.target.value)}
                        className="rounded border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-xs px-2 py-1"
                      >
                        {statusOptions.map(opt => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                      <button
                        onClick={() => handleSaveStatus(order.id)}
                        disabled={savingStatus[order.id] || statusEdit[order.id] === undefined || statusEdit[order.id] === order.status}
                        className="ml-2 px-2 py-1 text-xs bg-blue-600 text-white rounded disabled:opacity-50"
                      >
                        {savingStatus[order.id] ? "Saving..." : "Save"}
                      </button>
                      {statusError[order.id] && <div className="text-xs text-red-600 mt-1">{statusError[order.id]}</div>}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{/* Actions here, e.g. View/Edit */}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {orders.length > 0 && (
        <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
          <div className="flex flex-1 justify-between sm:hidden">
            <button
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
              className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Previous
            </button>
            <button
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page === pagination.totalPages}
              className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium">{(pagination.page - 1) * pagination.limit + 1}</span> to{" "}
                <span className="font-medium">{Math.min(pagination.page * pagination.limit, pagination.total)}</span> of{" "}
                <span className="font-medium">{pagination.total}</span> results
              </p>
            </div>
            <div>
              <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
                >
                  <span className="sr-only">Previous</span>
                  <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path
                      fillRule="evenodd"
                      d="M12.79 5.21a.75.75 0 01-.02 1.06L8.832 10l3.938 3.73a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
                {/* Current: "z-10 bg-indigo-600 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600", Default: "text-gray-900 hover:bg-gray-50 focus:outline-offset-0" */}
                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    aria-current={pagination.page === page ? "page" : undefined}
                    className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 ${pagination.page === page ? "z-10 bg-blue-600 text-white" : ""}`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.totalPages}
                  className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
                >
                  <span className="sr-only">Next</span>
                  <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path
                      fillRule="evenodd"
                      d="M7.21 14.79a.75.75 0 01.02-1.06L11.168 10 7.23 6.27a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminOrders
