"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import axios from "axios"
import { useAuth } from "../../contexts/AuthContext"

const Home = () => {
  const { user } = useAuth()
  const [featuredProducts, setFeaturedProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch featured products
        const productsResponse = await axios.get("http://localhost:5000/api/products/featured")
        setFeaturedProducts(productsResponse.data)

        // Fetch categories
        const categoriesResponse = await axios.get("http://localhost:5000/api/categories")
        setCategories(categoriesResponse.data)
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div>
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-blue-700 via-blue-500 to-blue-300 text-white min-h-[400px] flex items-center justify-center">
        <div className="absolute inset-0 overflow-hidden">
          <img
            src="/images/hero-furniture.jpg"
            alt="Modern furniture"
            className="w-full h-full object-cover opacity-30 blur-sm"
            onError={(e) => {
              e.target.onerror = null
              e.target.src = "https://via.placeholder.com/1200x600?text=MobiLux+Furniture"
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900/70 to-blue-400/40"></div>
        </div>
        <div className="relative z-10 text-center max-w-2xl mx-auto px-4 py-24">
          <h1 className="text-5xl font-extrabold tracking-tight mb-4 drop-shadow-lg">MobiLux Mobilier</h1>
          <p className="text-xl mb-8 drop-shadow">Eleganță și calitate pentru casa ta. Descoperă colecția noastră de mobilier lucrat manual.</p>
            <Link
              to={user ? "/products" : "/register"}
            className="inline-block bg-white text-blue-700 font-bold py-3 px-8 rounded-full shadow-lg hover:bg-blue-100 transition"
            >
              {user ? "Vezi produsele" : "Înregistrează-te"}
            </Link>
        </div>
      </div>

      {/* Categories Section */}
      <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-8">Caută după cameră</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((category) => (
            <Link key={category.id} to={`/products?category=${category.id}`} className="group">
              <div className="relative rounded-lg overflow-hidden bg-gray-100 aspect-w-1 aspect-h-1">
                <img
                  src={category.imageUrl || `https://via.placeholder.com/300x300?text=${category.name}`}
                  alt={category.name}
                  className="w-full h-64 object-cover group-hover:opacity-75 transition duration-300"
                />
                <div className="absolute inset-0 bg-black bg-opacity-20 group-hover:bg-opacity-30 transition duration-300"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <h3 className="text-xl font-bold text-white">{category.name === 'Living Room' ? 'Living' :
                   category.name === 'Bedroom' ? 'Dormitor' :
                   category.name === 'Dining Room' ? 'Sufragerie' :
                   category.name === 'Office' ? 'Birou' :
                   category.name === 'Kitchen' ? 'Bucătărie' :
                   category.name}</h3>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Featured Products Section */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Produse recomandate</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
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
                    <p className="mt-2 text-lg font-bold text-gray-900">{product.price.toFixed(2).replace('.', ',')} lei</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          <div className="mt-10 text-center">
            <Link
              to="/products"
              className="inline-block bg-blue-600 hover:bg-blue-700 py-3 px-8 rounded-md text-white font-medium transition duration-300"
            >
              Vezi toate produsele
            </Link>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-md bg-blue-500 text-white">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                className="h-6 w-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
            </div>
            <h3 className="mt-4 text-lg font-medium text-gray-900">Materiale de calitate</h3>
            <p className="mt-2 text-base text-gray-500">
              Folosim doar materiale de cea mai bună calitate pentru durabilitate și confort.
            </p>
          </div>
          <div className="text-center">
            <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-md bg-blue-500 text-white">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                className="h-6 w-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                />
              </svg>
            </div>
            <h3 className="mt-4 text-lg font-medium text-gray-900">Design personalizabil</h3>
            <p className="mt-2 text-base text-gray-500">Personalizează-ți mobilierul cu culori și materiale la alegere.</p>
          </div>
          <div className="text-center">
            <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-md bg-blue-500 text-white">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                className="h-6 w-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                />
              </svg>
            </div>
            <h3 className="mt-4 text-lg font-medium text-gray-900">Livrare rapidă</h3>
            <p className="mt-2 text-base text-gray-500">Asigurăm livrarea mobilierului în siguranță și la timp.</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home
