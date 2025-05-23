"use client"

import { useState, useEffect } from "react"
import { useLocation, Link } from "react-router-dom"
import axios from "axios"

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
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Our Products</h1>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-lg mb-6 border-2 border-blue-400/60">
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
              Search Products
            </label>
            <input
              type="text"
              id="search"
              name="search"
              value={filters.search}
              onChange={handleFilterChange}
              className="block w-full rounded-md border-2 border-blue-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 shadow-sm transition placeholder:text-gray-400 bg-blue-50/40"
              placeholder="Enter product name..."
            />
          </div>

          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
              Room
            </label>
            <select
              id="category"
              name="category"
              value={filters.category}
              onChange={handleFilterChange}
              className="block w-full rounded-md border-2 border-blue-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 shadow-sm transition bg-blue-50/40"
            >
              <option value="">All Rooms</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="minPrice" className="block text-sm font-medium text-gray-700 mb-1">
              Min Price
            </label>
            <input
              type="number"
              id="minPrice"
              name="minPrice"
              value={filters.minPrice}
              onChange={handleFilterChange}
              className="block w-full rounded-md border-2 border-blue-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 shadow-sm transition placeholder:text-gray-400 bg-blue-50/40"
              placeholder="Min Price"
            />
          </div>

          <div>
            <label htmlFor="maxPrice" className="block text-sm font-medium text-gray-700 mb-1">
              Max Price
            </label>
            <input
              type="number"
              id="maxPrice"
              name="maxPrice"
              value={filters.maxPrice}
              onChange={handleFilterChange}
              className="block w-full rounded-md border-2 border-blue-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 shadow-sm transition placeholder:text-gray-400 bg-blue-50/40"
              placeholder="Max Price"
            />
          </div>

          <div>
            <label htmlFor="sortBy" className="block text-sm font-medium text-gray-700 mb-1">
              Sort By
            </label>
            <select
              id="sortBy"
              name="sortBy"
              value={filters.sortBy}
              onChange={handleFilterChange}
              className="block w-full rounded-md border-2 border-blue-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 shadow-sm transition bg-blue-50/40"
            >
              <option value="name">Name</option>
              <option value="price">Price</option>
              <option value="createdAt">Newest</option>
            </select>
          </div>

          <div>
            <label htmlFor="sortOrder" className="block text-sm font-medium text-gray-700 mb-1">
              Order
            </label>
            <select
              id="sortOrder"
              name="sortOrder"
              value={filters.sortOrder}
              onChange={handleFilterChange}
              className="block w-full rounded-md border-2 border-blue-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 shadow-sm transition bg-blue-50/40"
            >
              <option value="asc">Ascending</option>
              <option value="desc">Descending</option>
            </select>
          </div>
        </div>

        <div className="mt-4 flex justify-end">
          <button
            onClick={clearFilters}
            className="px-4 py-2 text-sm font-medium text-blue-700 bg-blue-100 border border-blue-300 rounded-md shadow-sm hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 transition"
          >
            Clear Filters
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
                <div className="bg-white rounded-xl border-2 border-blue-100 shadow-md group-hover:shadow-xl group-hover:border-blue-400 transition duration-200 overflow-hidden">
                  <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden bg-blue-50">
                    <img
                      src={product.imageUrl || `https://via.placeholder.com/300x300?text=${product.name}`}
                      alt={product.name}
                      className="w-full h-48 object-cover group-hover:opacity-80 transition duration-300"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-gray-900">{product.name}</h3>
                    <p className="mt-1 text-sm text-gray-500">{product.category}</p>
                    <p className="mt-2 text-lg font-bold text-gray-900">${product.price.toFixed(2)}</p>
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
    </div>
  )
}

export default ProductList
