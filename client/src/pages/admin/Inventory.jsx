"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { Link } from "react-router-dom"

const AdminInventory = () => {
  const [materials, setMaterials] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [filters, setFilters] = useState({
    search: "",
    sortBy: "name",
    sortOrder: "asc",
    stockStatus: "", // 'low', 'out', 'all'
  })
  const [newMaterial, setNewMaterial] = useState({
    name: "",
    description: "",
    stock: 0,
    unit: "pcs",
    lowStockThreshold: 10,
  })
  const [editingMaterial, setEditingMaterial] = useState(null)
  const [formMode, setFormMode] = useState("add") // 'add' or 'edit'
  const [formVisible, setFormVisible] = useState(false)
  const [formError, setFormError] = useState("")
  const [formLoading, setFormLoading] = useState(false)

  useEffect(() => {
    fetchMaterials()
  }, [filters])

  const fetchMaterials = async () => {
    setLoading(true)
    try {
      // Build query string from filters
      const params = new URLSearchParams()

      if (filters.search) {
        params.append("search", filters.search)
      }

      params.append("sortBy", filters.sortBy)
      params.append("sortOrder", filters.sortOrder)

      if (filters.stockStatus === "low") {
        params.append("lowStock", "true")
      } else if (filters.stockStatus === "out") {
        params.append("outOfStock", "true")
      }

      const response = await axios.get(`http://localhost:5000/api/admin/materials?${params.toString()}`)
      setMaterials(response.data)
    } catch (err) {
      console.error("Error fetching materials:", err)
      setError("Failed to load materials. Please try again.")
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
  }

  const clearFilters = () => {
    setFilters({
      search: "",
      sortBy: "name",
      sortOrder: "asc",
      stockStatus: "",
    })
  }

  const handleNewMaterialChange = (e) => {
    const { name, value } = e.target

    // Permite string gol pentru stock și lowStockThreshold
    if (formMode === "add") {
      setNewMaterial((prev) => ({
        ...prev,
        [name]: name === "stock" || name === "lowStockThreshold" ? value : value,
      }))
    } else {
      setEditingMaterial((prev) => ({
        ...prev,
        [name]: name === "stock" || name === "lowStockThreshold" ? value : value,
      }))
    }
  }

  const handleAddMaterial = async (e) => {
    e.preventDefault()
    setFormError("")
    setFormLoading(true)

    try {
      // Convertim la număr doar la submit
      const payload = {
        ...newMaterial,
        stock: newMaterial.stock === "" ? 0 : Number(newMaterial.stock),
        lowStockThreshold: newMaterial.lowStockThreshold === "" ? 0 : Number(newMaterial.lowStockThreshold),
      }
      await axios.post("http://localhost:5000/api/admin/materials", payload)

      // Reset form and refresh materials
      setNewMaterial({
        name: "",
        description: "",
        stock: 0,
        unit: "pcs",
        lowStockThreshold: 10,
      })
      setFormVisible(false)
      fetchMaterials()
    } catch (err) {
      console.error("Error adding material:", err)
      setFormError(err.response?.data?.message || "Failed to add material. Please try again.")
    } finally {
      setFormLoading(false)
    }
  }

  const handleUpdateMaterial = async (e) => {
    e.preventDefault()
    setFormError("")
    setFormLoading(true)

    try {
      // Convertim la număr doar la submit
      const payload = {
        ...editingMaterial,
        stock: editingMaterial.stock === "" ? 0 : Number(editingMaterial.stock),
        lowStockThreshold: editingMaterial.lowStockThreshold === "" ? 0 : Number(editingMaterial.lowStockThreshold),
      }
      await axios.put(`http://localhost:5000/api/admin/materials/${editingMaterial.id}`, payload)

      // Reset form and refresh materials
      setEditingMaterial(null)
      setFormMode("add")
      setFormVisible(false)
      fetchMaterials()
    } catch (err) {
      console.error("Error updating material:", err)
      setFormError(err.response?.data?.message || "Failed to update material. Please try again.")
    } finally {
      setFormLoading(false)
    }
  }

  const handleDeleteMaterial = async (materialId) => {
    if (window.confirm("Are you sure you want to delete this material?")) {
      try {
        await axios.delete(`http://localhost:5000/api/admin/materials/${materialId}`)

        // Refresh materials
        fetchMaterials()
      } catch (err) {
        console.error("Error deleting material:", err)
        setError("Failed to delete material. Please try again.")
      }
    }
  }

  const startEditMaterial = (material) => {
    setEditingMaterial(material)
    setFormMode("edit")
    setFormVisible(true)
    setFormError("")
  }

  const startAddMaterial = () => {
    setFormMode("add")
    setFormVisible(true)
    setFormError("")
  }

  const cancelForm = () => {
    setFormVisible(false)
    setFormError("")
    setEditingMaterial(null)
    setFormMode("add")
  }

  // Helper function to get stock status color
  const getStockStatusColor = (stock, lowStockThreshold) => {
    if (stock === 0) {
      return "bg-red-100 text-red-800"
    } else if (stock <= lowStockThreshold) {
      return "bg-yellow-100 text-yellow-800"
    } else {
      return "bg-green-100 text-green-800"
    }
  }

  // Funcție pentru traducerea unității în română
  const translateUnit = (unit) => {
    switch (unit) {
      case 'pcs': return 'Bucăți';
      case 'm': return 'Metri';
      case 'kg': return 'Kilograme';
      case 'l': return 'Litri';
      case 'sqm': return 'Metri Pătrați';
      default: return unit;
    }
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Gestionare stoc</h1>
        <p className="mt-1 text-sm text-gray-500">Gestionează stocul și inventarul produselor</p>
      </div>

      {/* Filters */}
      <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6 mb-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
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
              placeholder="Nume produs"
              className="block w-full rounded-md border-2 border-blue-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 shadow-sm transition"
            />
          </div>
          <div>
            <label htmlFor="stockStatus" className="block text-sm font-medium text-gray-700 mb-1">
              Status stoc
            </label>
            <select
              id="stockStatus"
              name="stockStatus"
              value={filters.stockStatus}
              onChange={handleFilterChange}
              className="block w-full rounded-md border-2 border-blue-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 shadow-sm transition"
            >
              <option value="">Toate</option>
              <option value="low">Stoc redus</option>
              <option value="out">Stoc epuizat</option>
              <option value="in">În stoc</option>
            </select>
          </div>
          <div>
            <label htmlFor="sortBy" className="block text-sm font-medium text-gray-700 mb-1">
              Sortează după
            </label>
            <select
              id="sortBy"
              name="sortBy"
              value={filters.sortBy}
              onChange={handleFilterChange}
              className="block w-full rounded-md border-2 border-blue-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 shadow-sm transition"
            >
              <option value="name">Nume</option>
              <option value="stock">Stoc</option>
              <option value="price">Preț</option>
              <option value="updatedAt">Ultima actualizare</option>
            </select>
          </div>
        </div>
        {/* Add Stock Button - left aligned under filters */}
        <div className="mt-4 flex justify-start">
          <button
            onClick={startAddMaterial}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Adaugă stoc nou
          </button>
        </div>
      </div>

      {/* Material Form */}
      {formVisible && (
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            {formMode === "add" ? "Adaugă Material Nou" : "Editează Material"}
          </h2>

          {formError && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
              <span className="block sm:inline">{formError}</span>
            </div>
          )}

          <form onSubmit={formMode === "add" ? handleAddMaterial : handleUpdateMaterial}>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div className="border border-gray-300 rounded-md bg-gray-50 p-4 mb-2">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Nume Material
                </label>
                <input
                  type="text"
                  name="name"
                  id="name"
                  required
                  value={formMode === "add" ? newMaterial.name : editingMaterial?.name}
                  onChange={handleNewMaterialChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
              </div>

              <div className="border border-gray-300 rounded-md bg-gray-50 p-4 mb-2">
                <label htmlFor="stock" className="block text-sm font-medium text-gray-700">
                  Cantitate în Stoc
                </label>
                <input
                  type="number"
                  name="stock"
                  id="stock"
                  required
                  min="0"
                  value={formMode === "add" ? newMaterial.stock : editingMaterial?.stock}
                  onChange={handleNewMaterialChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
              </div>

              <div className="border border-gray-300 rounded-md bg-gray-50 p-4 mb-2">
                <label htmlFor="unit" className="block text-sm font-medium text-gray-700">
                  Unitate de Măsură
                </label>
                <select
                  name="unit"
                  id="unit"
                  required
                  value={formMode === "add" ? newMaterial.unit : editingMaterial?.unit}
                  onChange={handleNewMaterialChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                >
                  <option value="pcs">Bucăți</option>
                  <option value="m">Metri</option>
                  <option value="kg">Kilograme</option>
                  <option value="l">Litri</option>
                  <option value="sqm">Metri Pătrați</option>
                </select>
              </div>

              <div className="border border-gray-300 rounded-md bg-gray-50 p-4 mb-2">
                <label htmlFor="lowStockThreshold" className="block text-sm font-medium text-gray-700">
                  Prag Stoc Minim
                </label>
                <input
                  type="number"
                  name="lowStockThreshold"
                  id="lowStockThreshold"
                  required
                  min="0"
                  value={formMode === "add" ? newMaterial.lowStockThreshold : editingMaterial?.lowStockThreshold}
                  onChange={handleNewMaterialChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
              </div>

              <div className="sm:col-span-2 border border-gray-300 rounded-md bg-gray-50 p-4 mb-2">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                  Descriere
                </label>
                <textarea
                  name="description"
                  id="description"
                  rows="3"
                  value={formMode === "add" ? newMaterial.description : editingMaterial?.description}
                  onChange={handleNewMaterialChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                ></textarea>
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                type="button"
                onClick={cancelForm}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Anulează
              </button>
              <button
                type="submit"
                disabled={formLoading}
                className={`px-4 py-2 text-sm font-medium text-white border border-transparent rounded-md shadow-sm ${
                  formLoading ? "bg-blue-400" : "bg-blue-600 hover:bg-blue-700"
                } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
              >
                {formLoading ? "Se salvează..." : formMode === "add" ? "Adaugă Material" : "Actualizează Material"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Materials Table */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      ) : materials.length === 0 ? (
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <p className="text-lg text-gray-600 mb-4">No materials found</p>
          <div className="flex justify-center space-x-4">
            <button
              onClick={clearFilters}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Clear Filters
            </button>
            <button
              onClick={startAddMaterial}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Add New Material
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Material
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Descriere
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Stoc
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Unitate
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Acțiuni
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {materials.map((material) => (
                <tr key={material.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{material.name}</div>
                    <div className="text-sm text-gray-500">ID: {material.id}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{material.description || "No description"}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStockStatusColor(
                        material.stock,
                        material.lowStockThreshold,
                      )}`}
                    >
                      {material.stock} {translateUnit(material.unit)}
                    </span>
                    {material.stock <= material.lowStockThreshold && (
                      <p className="text-xs text-red-600 mt-1">
                        {material.stock === 0 ? "Out of stock!" : "Low stock!"}
                      </p>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{translateUnit(material.unit)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button onClick={() => startEditMaterial(material)} className="text-blue-600 hover:text-blue-900">
                        Editează
                      </button>
                      <button
                        onClick={() => handleDeleteMaterial(material.id)}
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
      )}
    </div>
  )
}

export default AdminInventory
