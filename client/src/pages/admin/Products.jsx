"use client"

import React, { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import axios from "axios"

const AdminProducts = () => {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [filters, setFilters] = useState({
    category: "",
    search: "",
    minPrice: "",
    maxPrice: "",
    sortBy: "name",
    sortOrder: "asc",
  })
  const [categories, setCategories] = useState([])
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  })
  const [selectedProducts, setSelectedProducts] = useState([])
  const [bulkActionLoading, setBulkActionLoading] = useState(false)
  const [editingStockId, setEditingStockId] = useState(null)
  const [editingStockValue, setEditingStockValue] = useState(0)

  useEffect(() => {
    fetchCategories()
    fetchProducts()
  }, [filters, pagination.page, pagination.limit])

  const fetchCategories = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/categories")
      setCategories(response.data)
    } catch (error) {
      console.error("Error fetching categories:", error)
    }
  }

  const fetchProducts = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()

      if (filters.category) {
        params.append("category", filters.category)
      }

      if (filters.search) {
        params.append("search", filters.search)
      }

      if (filters.minPrice) {
        params.append("minPrice", filters.minPrice)
      }

      if (filters.maxPrice) {
        params.append("maxPrice", filters.maxPrice)
      }

      params.append("sortBy", filters.sortBy)
      params.append("sortOrder", filters.sortOrder)
      params.append("page", pagination.page)
      params.append("limit", pagination.limit)

      const response = await axios.get(`http://localhost:5000/api/admin/products?${params.toString()}`)

      setProducts(response.data.products)
      setPagination({
        ...pagination,
        total: response.data.total,
        totalPages: response.data.totalPages,
      })
    } catch (err) {
      console.error("Error fetching products:", err)
      setError("Failed to load products. Please try again.")
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
      category: "",
      search: "",
      minPrice: "",
      maxPrice: "",
      sortBy: "name",
      sortOrder: "asc",
    })

    setPagination((prev) => ({
      ...prev,
      page: 1,
    }))
  }

  const handleSelectProduct = (productId) => {
    setSelectedProducts((prev) => {
      if (prev.includes(productId)) {
        return prev.filter((id) => id !== productId)
      } else {
        return [...prev, productId]
      }
    })
  }

  const handleSelectAll = () => {
    if (selectedProducts.length === products.length) {
      setSelectedProducts([])
    } else {
      setSelectedProducts(products.map((product) => product.id))
    }
  }

  const handleBulkDelete = async () => {
    if (selectedProducts.length === 0) return

    if (window.confirm(`Sunteți sigur că doriți să ștergeți ${selectedProducts.length} produse selectate?`)) {
      setBulkActionLoading(true)
      try {
        await axios.post("http://localhost:5000/api/products/bulk-delete", {
          productIds: selectedProducts,
        })

        fetchProducts()

        setSelectedProducts([])
      } catch (err) {
        console.error("Error deleting products:", err)
        setError("Failed to delete products. Please try again.")
      } finally {
        setBulkActionLoading(false)
      }
    }
  }

  const handleDeleteProduct = async (productId) => {
    if (window.confirm("Sunteți sigur că doriți să ștergeți acest produs?")) {
      try {
        await axios.delete(`http://localhost:5000/api/products/${productId}`)

        fetchProducts()
      } catch (err) {
        console.error("Error deleting product:", err)
        setError("Failed to delete product. Please try again.")
      }
    }
  }

  const handleStockClick = (product) => {
    setEditingStockId(product.id)
    setEditingStockValue(product.stock)
  }

  const handleStockChange = (e) => {
    setEditingStockValue(e.target.value)
  }

  const handleStockBlur = async (product) => {
    if (Number(editingStockValue) !== product.stock) {
      try {
        await axios.put(`http://localhost:5000/api/admin/products/${product.id}`, { stock: Number(editingStockValue) })
        fetchProducts()
      } catch (err) {
        setError("Failed to update stock. Please try again.")
      }
    }
    setEditingStockId(null)
  }

  const handleStockKeyDown = (e, product) => {
    if (e.key === "Enter") {
      e.target.blur()
    }
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Administrare produse</h1>
        <p className="mt-1 text-sm text-gray-500">Adaugă, editează și gestionează stocul de produse</p>
      </div>

      {/* Filters */}
      <div className="bg-white/80 backdrop-blur-md p-6 rounded-2xl shadow-2xl mb-8 border border-blue-200 flex flex-col gap-4">
        <div className="grid grid-cols-1 sm:grid-cols-6 gap-6">
          <div>
            <label htmlFor="category" className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
              <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="7" width="18" height="13" rx="2"/><path d="M16 3v4M8 3v4"/></svg>
              Categorie
            </label>
            <select
              id="category"
              name="category"
              value={filters.category}
              onChange={handleFilterChange}
              className="block w-full rounded-full border border-blue-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 shadow transition bg-blue-50/60 px-4 py-2 text-base outline-none"
            >
              <option value="">Toate categoriile</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="search" className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
              <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              Caută
            </label>
            <input
              type="text"
              id="search"
              name="search"
              value={filters.search}
              onChange={handleFilterChange}
              placeholder="Nume produs"
              className="block w-full rounded-full border border-blue-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 shadow transition placeholder:text-gray-400 bg-blue-50/60 px-4 py-2 text-base outline-none"
            />
          </div>
          <div>
            <label htmlFor="minPrice" className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
              <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 8v8m0 0l-3-3m3 3l3-3"/><rect x="3" y="3" width="18" height="18" rx="2"/></svg>
              Preț minim
            </label>
            <input
              type="number"
              id="minPrice"
              name="minPrice"
              value={filters.minPrice}
              onChange={handleFilterChange}
              placeholder="Preț minim"
              className="block w-full rounded-full border border-blue-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 shadow transition placeholder:text-gray-400 bg-blue-50/60 px-4 py-2 text-base outline-none"
            />
          </div>
          <div>
            <label htmlFor="maxPrice" className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
              <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 16V8m0 0l3 3m-3-3l-3 3"/><rect x="3" y="3" width="18" height="18" rx="2"/></svg>
              Preț maxim
            </label>
            <input
              type="number"
              id="maxPrice"
              name="maxPrice"
              value={filters.maxPrice}
              onChange={handleFilterChange}
              placeholder="Preț maxim"
              className="block w-full rounded-full border border-blue-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 shadow transition placeholder:text-gray-400 bg-blue-50/60 px-4 py-2 text-base outline-none"
            />
          </div>
          <div>
            <label htmlFor="sortBy" className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
              <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 6h18M3 12h12M3 18h6"/></svg>
              Sortează după
            </label>
            <select
              id="sortBy"
              name="sortBy"
              value={filters.sortBy}
              onChange={handleFilterChange}
              className="block w-full rounded-full border border-blue-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 shadow transition bg-blue-50/60 px-4 py-2 text-base outline-none"
            >
              <option value="name">Nume</option>
              <option value="price">Preț</option>
              <option value="stock">Stoc</option>
              <option value="createdAt">Data adăugării</option>
            </select>
          </div>
          <div>
            <label htmlFor="sortOrder" className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
              <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M6 9l6 6 6-6"/></svg>
              Ordine
            </label>
            <select
              id="sortOrder"
              name="sortOrder"
              value={filters.sortOrder}
              onChange={handleFilterChange}
              className="block w-full rounded-full border border-blue-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 shadow transition bg-blue-50/60 px-4 py-2 text-base outline-none"
            >
              <option value="asc">Crescător</option>
              <option value="desc">Descrescător</option>
            </select>
          </div>
        </div>
        <div className="mt-2 flex justify-end">
          <button
            onClick={clearFilters}
            className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-gradient-to-r from-blue-500 to-blue-700 text-white font-semibold shadow-lg hover:from-blue-600 hover:to-blue-800 transition focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 text-base"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12"/></svg>
            Resetează filtrele
          </button>
        </div>
      </div>

      {/* Add Product Button */}
      <div className="mb-6">
        <Link
          to="/admin/products/new"
          className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-gradient-to-r from-blue-500 to-blue-700 text-white font-semibold shadow-lg hover:from-blue-600 hover:to-blue-800 transition focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 text-base"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 4v16m8-8H4"/></svg>
          Adaugă produs nou
        </Link>
      </div>

      {/* Products Table */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Produs
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Categorie
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Preț
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Stoc
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
            {products.map((product, idx) => (
              <tr
                key={product.id}
                className={`transition-all duration-200 border-b border-gray-100
                  ${idx !== 0 ? 'hover:shadow-2xl hover:border-2 hover:border-blue-400 hover:-translate-y-1 hover:bg-blue-50' : 'hover:shadow-2xl hover:-translate-y-1 hover:bg-blue-50'}`}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      <img className="h-10 w-10 rounded-full object-cover" src={product.imageUrl || `https://via.placeholder.com/40?text=${product.name.charAt(0)}`} alt={product.name} />
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">{product.name}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.category}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{product.price.toFixed(2).replace('.', ',')} lei</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{product.stock}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    product.stock === 0 ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"
                  } cursor-pointer`}
                    title="Click to edit stock"
                    onClick={() => handleStockClick(product)}
                  >
                    {product.stock === 0 ? "Epuizat" : "În stoc"}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    <Link
                      to={`/admin/products/${product.id}/edit`}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      Editează
                    </Link>
                    <button
                      onClick={() => handleDeleteProduct(product.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Șterge
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
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
              {[...Array(pagination.totalPages)].map((_, index) => (
                <button
                  key={index + 1}
                  onClick={() => handlePageChange(index + 1)}
                  className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                    pagination.page === index + 1
                      ? "z-10 bg-blue-50 border-blue-500 text-blue-600"
                      : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                  }`}
                >
                  {index + 1}
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
    </div>
  )
}

export default AdminProducts
