"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import axios from "axios"
import { useAuth } from "../../contexts/AuthContext"

const ProductDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { addToCart } = useAuth()

  const [product, setProduct] = useState(null)
  const [materials, setMaterials] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [quantity, setQuantity] = useState(1)
  const [customizations, setCustomizations] = useState({
    color: "",
    material: "",
  })
  const [addingToCart, setAddingToCart] = useState(false)
  const [notification, setNotification] = useState({ show: false, message: "", type: "" })

  useEffect(() => {
    const fetchProductAndMaterials = async () => {
      setLoading(true)
      try {
        // Fetch product details
        const productResponse = await axios.get(`http://localhost:5000/api/products/${id}`)
        setProduct(productResponse.data)

        // Set default customizations
        if (productResponse.data.availableColors && productResponse.data.availableColors.length > 0) {
          setCustomizations((prev) => ({
            ...prev,
            color: productResponse.data.availableColors[0],
          }))
        }

        // Fetch available materials
        const materialsResponse = await axios.get("http://localhost:5000/api/materials")
        setMaterials(materialsResponse.data)

        // Set default material if available
        if (materialsResponse.data.length > 0) {
          setCustomizations((prev) => ({
            ...prev,
            material: materialsResponse.data[0].id,
          }))
        }
      } catch (error) {
        console.error("Error fetching product details:", error)
        setError("Failed to load product details. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    fetchProductAndMaterials()
  }, [id])

  const handleQuantityChange = (e) => {
    const value = Number.parseInt(e.target.value)
    if (value > 0) {
      setQuantity(value)
    }
  }

  const handleCustomizationChange = (e) => {
    const { name, value } = e.target
    setCustomizations((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleAddToCart = async () => {
    setAddingToCart(true)
    try {
      const result = await addToCart(product.id, quantity, customizations)

      if (result.success) {
        setNotification({
          show: true,
          message: "Product added to cart successfully!",
          type: "success",
        })

        // Hide notification after 3 seconds
        setTimeout(() => {
          setNotification({ show: false, message: "", type: "" })
        }, 3000)
      } else {
        setNotification({
          show: true,
          message: result.message || "Failed to add product to cart.",
          type: "error",
        })
      }
    } catch (error) {
      console.error("Error adding to cart:", error)
      setNotification({
        show: true,
        message: "An error occurred. Please try again.",
        type: "error",
      })
    } finally {
      setAddingToCart(false)
    }
  }

  const handleBuyNow = async () => {
    setAddingToCart(true)
    try {
      const result = await addToCart(product.id, quantity, customizations)

      if (result.success) {
        navigate("/cart")
      } else {
        setNotification({
          show: true,
          message: result.message || "Failed to add product to cart.",
          type: "error",
        })
      }
    } catch (error) {
      console.error("Error adding to cart:", error)
      setNotification({
        show: true,
        message: "An error occurred. Please try again.",
        type: "error",
      })
    } finally {
      setAddingToCart(false)
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

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900">Product not found</h3>
          <p className="mt-1 text-sm text-gray-500">
            The product you're looking for doesn't exist or has been removed.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Notification */}
      {notification.show && (
        <div
          className={`fixed top-4 right-4 z-50 p-4 rounded-md shadow-md ${
            notification.type === "success" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
          }`}
        >
          {notification.message}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Product Image */}
        <div className="bg-white rounded-lg overflow-hidden shadow-md">
          <img
            src={product.imageUrl || `https://via.placeholder.com/600x400?text=${product.name}`}
            alt={product.name}
            className="w-full h-auto object-cover"
          />
        </div>

        {/* Product Details */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
          <p className="mt-2 text-sm text-gray-500">{product.category}</p>
          <p className="mt-4 text-2xl font-bold text-gray-900">${product.price.toFixed(2)}</p>

          <div className="mt-6">
            <h2 className="text-lg font-medium text-gray-900">Description</h2>
            <p className="mt-2 text-gray-600">{product.description}</p>
          </div>

          <div className="mt-6">
            <h2 className="text-lg font-medium text-gray-900">Specifications</h2>
            <div className="mt-2 grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Dimensions</p>
                <p className="text-gray-900">{product.dimensions}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Weight</p>
                <p className="text-gray-900">{product.weight} kg</p>
              </div>
              {/* Safe specifications rendering */}
              {(() => {
                let specs = product.specifications;
                if (typeof specs === "string") {
                  try {
                    specs = JSON.parse(specs);
                  } catch {
                    specs = {};
                  }
                }
                return specs && typeof specs === 'object' && !Array.isArray(specs)
                  ? Object.entries(specs).map(([key, value]) => (
                      <div key={key}>
                        <p className="text-sm font-medium text-gray-500">{key}</p>
                        <p className="text-gray-900">{value}</p>
                      </div>
                    ))
                  : null;
              })()}
            </div>
          </div>

          {/* Customizations */}
          <div className="mt-6">
            <h2 className="text-lg font-medium text-gray-900">Customize Your Product</h2>

            {/* Color Selection */}
            {(Array.isArray(product.availableColors) && product.availableColors.length > 0) && (
              <div className="mt-4">
                <label htmlFor="color" className="block text-sm font-medium text-gray-700">
                  Color
                </label>
                <select
                  id="color"
                  name="color"
                  value={customizations.color}
                  onChange={handleCustomizationChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                >
                  {product.availableColors.map((color) => (
                    <option key={color} value={color}>
                      {color}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Material Selection */}
            {materials.length > 0 && (
              <div className="mt-4">
                <label htmlFor="material" className="block text-sm font-medium text-gray-700">
                  Material
                </label>
                <select
                  id="material"
                  name="material"
                  value={customizations.material}
                  onChange={handleCustomizationChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                >
                  {materials.map((material) => (
                    <option key={material.id} value={material.id}>
                      {material.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Quantity */}
          <div className="mt-6">
            <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">
              Quantity
            </label>
            <div className="mt-1 flex rounded-md shadow-sm">
              <input
                type="number"
                name="quantity"
                id="quantity"
                min="1"
                value={quantity}
                onChange={handleQuantityChange}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
            </div>
          </div>

          {/* Add to Cart and Buy Now Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row gap-4">
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={addingToCart}
              className={`flex-1 py-3 px-4 rounded-md text-white font-medium ${
                addingToCart ? "bg-blue-400" : "bg-blue-600 hover:bg-blue-700"
              } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
            >
              {addingToCart ? "Adding..." : "Add to Cart"}
            </button>
            <button
              type="button"
              onClick={handleBuyNow}
              disabled={addingToCart}
              className={`flex-1 py-3 px-4 rounded-md text-white font-medium ${
                addingToCart ? "bg-green-400" : "bg-green-600 hover:bg-green-700"
              } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500`}
            >
              Buy Now
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductDetail
