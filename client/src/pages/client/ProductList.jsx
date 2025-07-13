"use client"

import { useState, useEffect } from "react"
import { useLocation, Link } from "react-router-dom"
import axios from "axios"
import Chatbot from '../../components/client/Chatbot'

const ProductList = () => {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    category: "",
    minPrice: "",
    maxPrice: "",
    sortBy: "name",
    sortOrder: "asc",
    search: "",
  })
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0,
  })

  const location = useLocation()

  useEffect(() => {
    // Parse query parameters
    const queryParams = new URLSearchParams(location.search)
    const categoryParam = queryParams.get("category")

    if (categoryParam) {
      setFilters((prev) => ({
        ...prev,
        category: categoryParam,
      }))
    }

    // Fetch categories
    const fetchCategories = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/categories")
        setCategories(response.data)
      } catch (error) {
        console.error("Error fetching categories:", error)
      }
    }

    fetchCategories()
  }, [location.search])

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true)
      try {
        // Build query string from filters
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

        const response = await axios.get(`http://localhost:5000/api/products?${params.toString()}`)
        setProducts(response.data.products)
        setPagination({
          ...pagination,
          total: response.data.total,
          totalPages: response.data.totalPages,
        })
      } catch (error) {
        console.error("Error fetching products:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [filters, pagination.page, pagination.limit])

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
      category: "",
      minPrice: "",
      maxPrice: "",
      sortBy: "name",
      sortOrder: "asc",
      search: "",
    })
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Produsele noastre</h1>

      {/* Filters */}
      <div className="bg-white/80 backdrop-blur-md p-6 rounded-2xl shadow-2xl mb-8 border border-blue-200 flex flex-col gap-4">
        <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
          <div>
            <label htmlFor="search" className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
              <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              Caută produse
            </label>
            <input
              type="text"
              id="search"
              name="search"
              value={filters.search}
              onChange={handleFilterChange}
              className="block w-full rounded-full border border-blue-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 shadow transition placeholder:text-gray-400 bg-blue-50/60 px-4 py-2 text-base outline-none"
              placeholder="Introdu numele produsului..."
            />
          </div>

          <div>
            <label htmlFor="category" className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
              <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="7" width="18" height="13" rx="2"/><path d="M16 3v4M8 3v4"/></svg>
              Cameră
            </label>
            <select
              id="category"
              name="category"
              value={filters.category}
              onChange={handleFilterChange}
              className="block w-full rounded-full border border-blue-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 shadow transition bg-blue-50/60 px-4 py-2 text-base outline-none"
            >
              <option value="">Toate camerele</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>{category.name}</option>
              ))}
            </select>
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
              className="block w-full rounded-full border border-blue-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 shadow transition placeholder:text-gray-400 bg-blue-50/60 px-4 py-2 text-base outline-none"
              placeholder="Preț minim"
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
              className="block w-full rounded-full border border-blue-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 shadow transition placeholder:text-gray-400 bg-blue-50/60 px-4 py-2 text-base outline-none"
              placeholder="Preț maxim"
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
              <option value="createdAt">Cele mai noi</option>
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

      {/* Products Grid */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900">No products found</h3>
          <p className="mt-1 text-sm text-gray-500">Try adjusting your filters to find what you're looking for.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <Link key={product.id} to={`/products/${product.id}`} className="group">
                <div className="bg-white rounded-xl border-2 border-blue-100 shadow-md group-hover:shadow-xl group-hover:border-blue-400 transition duration-200 overflow-hidden flex flex-col" style={{ width: 300, height: 360 }}>
                  <div style={{ width: '100%', height: 180, overflow: 'hidden' }}>
                    <img
                      src={product.imageUrl || `https://via.placeholder.com/300x300?text=${product.name}`}
                      alt={product.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      className="transition duration-300 group-hover:opacity-80"
                    />
                  </div>
                  <div className="flex-1 flex flex-col p-4">
                    <h3 className="text-lg font-semibold text-gray-900 line-clamp-2 min-h-[48px]">{product.name}</h3>
                    <p className="mt-1 text-sm text-gray-500">{product.category}</p>
                    <p className="mt-2 text-lg font-bold text-gray-900">{product.price.toFixed(2).replace('.', ',')} lei</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Pagination */}
          <div className="mt-8 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium">{(pagination.page - 1) * pagination.limit + 1}</span> to{" "}
                <span className="font-medium">{Math.min(pagination.page * pagination.limit, pagination.total)}</span>{" "}
                of <span className="font-medium">{pagination.total}</span> results
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                    pagination.page === 1 ? "text-gray-300" : "text-gray-500 hover:bg-gray-50"
                  }`}
                >
                  <span className="sr-only">Previous</span>
                  <svg
                    className="h-5 w-5"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>

                {/* Page numbers */}
                {[...Array(pagination.totalPages)].map((_, index) => {
                  const pageNumber = index + 1
                  const isCurrentPage = pageNumber === pagination.page
                  const isNearCurrentPage =
                    Math.abs(pageNumber - pagination.page) <= 1 ||
                    pageNumber === 1 ||
                    pageNumber === pagination.totalPages

                  if (!isNearCurrentPage) {
                    if (
                      (pageNumber === 2 && pagination.page > 3) ||
                      (pageNumber === pagination.totalPages - 1 && pagination.page < pagination.totalPages - 2)
                    ) {
                      return <span key={pageNumber} className="px-4 py-2 text-gray-500">...</span>
                    }
                    return null
                  }

                  return (
                    <button
                      key={pageNumber}
                      onClick={() => handlePageChange(pageNumber)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        isCurrentPage
                          ? "z-10 bg-blue-50 border-blue-500 text-blue-600"
                          : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                      }`}
                    >
                      {pageNumber}
                    </button>
                  )
                })}

                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.totalPages}
                  className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                    pagination.page === pagination.totalPages ? "text-gray-300" : "text-gray-500 hover:bg-gray-50"
                  }`}
                >
                  <span className="sr-only">Next</span>
                  <svg
                    className="h-5 w-5"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </nav>
            </div>
          </div>
        </>
      )}
      <Chatbot />
    </div>
  )
}

export default ProductList
