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

        if (filters.minPrice) {
          params.append("minPrice", filters.minPrice)
        }

        if (filters.maxPrice) {
          params.append("maxPrice", filters.maxPrice)
        }

        params.append("sortBy", filters.sortBy)
        params.append("sortOrder", filters.sortOrder)

        const response = await axios.get(`http://localhost:5000/api/products?${params.toString()}`)
        setProducts(response.data.products)
      } catch (error) {
        console.error("Error fetching products:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [filters])

  const handleFilterChange = (e) => {
    const { name, value } = e.target
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const clearFilters = () => {
    setFilters({
      category: "",
      minPrice: "",
      maxPrice: "",
      sortBy: "name",
      sortOrder: "asc",
    })
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Our Products</h1>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
              Room
            </label>
            <select
              id="category"
              name="category"
              value={filters.category}
              onChange={handleFilterChange}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
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
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
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
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
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
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
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
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            >
              <option value="asc">Ascending</option>
              <option value="desc">Descending</option>
            </select>
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <Link key={product.id} to={`/products/${product.id}`} className="group">
              <div className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition duration-300">
                <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden">
                  <img
                    src={product.imageUrl || `https://via.placeholder.com/300x300?text=${product.name}`}
                    alt={product.name}
                    className="w-full h-48 object-cover group-hover:opacity-75 transition duration-300"
                  />
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-medium text-gray-900">{product.name}</h3>
                  <p className="mt-1 text-sm text-gray-500">{product.category}</p>
                  <p className="mt-2 text-lg font-bold text-gray-900">${product.price.toFixed(2)}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

export default ProductList
