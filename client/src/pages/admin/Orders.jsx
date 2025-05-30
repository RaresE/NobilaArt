"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { Link } from "react-router-dom"

const statusOptions = [
  { value: "pending", label: "În așteptare" },
  { value: "processing", label: "În procesare" },
  { value: "shipped", label: "Expediată" },
  { value: "delivered", label: "Livrată" },
  { value: "cancelled", label: "Anulată" },
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
  const [teams, setTeams] = useState([])
  const [assignTeam, setAssignTeam] = useState({})
  const [savingTeam, setSavingTeam] = useState({})
  const [teamError, setTeamError] = useState({})

  useEffect(() => {
    fetchOrders()
    fetchTeams()
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

  const fetchTeams = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/admin/teams")
      setTeams(res.data)
    } catch {
      setTeams([])
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

  // Helper function to get status label in Romanian
  const getStatusLabel = (status) => {
    switch (status) {
      case "pending":
        return "În așteptare"
      case "processing":
        return "În procesare"
      case "shipped":
        return "Expediată"
      case "delivered":
        return "Livrată"
      case "cancelled":
        return "Anulată"
      default:
        return status
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

  const handleTeamChange = (orderId, teamId) => {
    setAssignTeam((prev) => ({ ...prev, [orderId]: teamId }))
  }

  const handleSaveTeam = async (orderId) => {
    setSavingTeam((prev) => ({ ...prev, [orderId]: true }))
    setTeamError((prev) => ({ ...prev, [orderId]: null }))
    try {
      await axios.put(`http://localhost:5000/api/admin/orders/${orderId}/assign-team`, {
        teamId: assignTeam[orderId],
      })
      setOrders((prev) => prev.map((order) => order.id === orderId ? { ...order, teamId: assignTeam[orderId] } : order))
      setAssignTeam((prev) => ({ ...prev, [orderId]: undefined }))
    } catch (err) {
      setTeamError((prev) => ({ ...prev, [orderId]: "Failed to assign team" }))
    } finally {
      setSavingTeam((prev) => ({ ...prev, [orderId]: false }))
    }
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Gestionare comenzi</h1>
        <p className="mt-1 text-sm text-gray-500">Vezi și gestionează toate comenzile</p>
      </div>

      {/* Filters */}
      <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6 mb-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              id="status"
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              className="block w-full rounded-md border-2 border-blue-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 shadow-sm transition"
            >
              <option value="">Toate</option>
              <option value="pending">În așteptare</option>
              <option value="processing">În procesare</option>
              <option value="shipped">Expediată</option>
              <option value="delivered">Livrată</option>
              <option value="cancelled">Anulată</option>
            </select>
          </div>
          <div>
            <label htmlFor="dateFrom" className="block text-sm font-medium text-gray-700 mb-1">
              Data de la
            </label>
            <input
              type="date"
              id="dateFrom"
              name="dateFrom"
              value={filters.dateFrom}
              onChange={handleFilterChange}
              className="block w-full rounded-md border-2 border-blue-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 shadow-sm transition"
            />
          </div>
          <div>
            <label htmlFor="dateTo" className="block text-sm font-medium text-gray-700 mb-1">
              Data până la
            </label>
            <input
              type="date"
              id="dateTo"
              name="dateTo"
              value={filters.dateTo}
              onChange={handleFilterChange}
              className="block w-full rounded-md border-2 border-blue-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 shadow-sm transition"
            />
          </div>
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
              Caută
            </label>
            <input
              type="text"
              id="search"
              name="search"
              value={filters.search}
              onChange={handleFilterChange}
              placeholder="ID comandă sau nume client"
              className="block w-full rounded-md border-2 border-blue-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 shadow-sm transition"
            />
          </div>
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
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID Comandă
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Client
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Data
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acțiuni
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {orders.map((order) => (
                <tr key={order.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                    #{order.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order.user ? order.user.name : order.User ? order.User.name : "N/A"}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(order.createdAt)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order.total ? `${order.total.toFixed(2).replace('.', ',')} lei` : "-"}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(order.status)}`}>
                      {order.status ? getStatusLabel(order.status) : "-"}
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
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <Link
                      to={`/admin/orders/${order.id}`}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      Vezi detalii
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {orders.length > 0 && (
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 mt-4">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Anterior
            </button>
            <button
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page === pagination.totalPages}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Următor
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Afișare <span className="font-medium">{pagination.page * pagination.limit - pagination.limit + 1}</span> până la{" "}
                <span className="font-medium">{Math.min(pagination.page * pagination.limit, pagination.total)}</span> din{" "}
                <span className="font-medium">{pagination.total}</span> rezultate
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                >
                  Anterior
                </button>
                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                      pagination.page === page
                        ? "z-10 bg-blue-50 border-blue-500 text-blue-600"
                        : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.totalPages}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                >
                  Următor
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
