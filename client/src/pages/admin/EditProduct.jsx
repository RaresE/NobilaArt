import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Select from "react-select";

const EditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [categories, setCategories] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [colorsInput, setColorsInput] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [prodRes, catRes, matRes] = await Promise.all([
          axios.get(`http://localhost:5000/api/admin/products/${id}`),
          axios.get("http://localhost:5000/api/categories"),
          axios.get("http://localhost:5000/api/admin/materials"),
        ]);
        const allMaterialOptions = matRes.data.map(m => ({ value: String(m.id), label: m.name }));
        const selectedIds = Array.isArray(prodRes.data.availableMaterials)
          ? prodRes.data.availableMaterials.map(String)
          : [];
        const selectedOptions = selectedIds.map(id => {
          const found = allMaterialOptions.find(opt => opt.value === id);
          return found || { value: id, label: `Missing (id: ${id})` };
        });
        setProduct({
          ...prodRes.data,
          availableMaterials: selectedOptions,
        });
        setCategories(catRes.data);
        setMaterials(matRes.data);
        if (prodRes.data.availableColors && Array.isArray(prodRes.data.availableColors)) {
          setColorsInput(prodRes.data.availableColors.join(", "));
        } else {
          setColorsInput("");
        }
      } catch (err) {
        setError("Failed to load product or categories");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    if (name === "price" || name === "stock" || name === "weight") {
      setProduct((prev) => ({ ...prev, [name]: Number(value) }));
    } else {
      setProduct((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleMaterialsChange = (selectedOptions) => {
    setProduct((prev) => ({
      ...prev,
      availableMaterials: selectedOptions || [],
    }));
  };

  const handleColorsInputChange = (e) => {
    setColorsInput(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const payload = {
        ...product,
        isVisible: product.isVisible ? 1 : 0,
        availableMaterials: (product.availableMaterials || []).map(opt => opt.value),
        availableColors: colorsInput.split(",").map(c => c.trim()).filter(Boolean),
      };
      console.log("Submitting product:", payload);
      await axios.put(`http://localhost:5000/api/admin/products/${id}`, payload);
      navigate("/admin/products");
    } catch (err) {
      setError("Failed to update product. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;
  if (error) return <div className="p-8 text-red-600">{error}</div>;
  if (!product) return null;

  return (
    <div className="max-w-xl mx-auto bg-white p-8 rounded shadow mt-8">
      <h1 className="text-2xl font-bold mb-4">Edit Product</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Name</label>
          <input
            type="text"
            name="name"
            value={product.name}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Price</label>
          <input
            type="number"
            name="price"
            value={product.price}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
            min={0}
            step={0.01}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Stock</label>
          <input
            type="number"
            name="stock"
            value={product.stock}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
            min={0}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Category</label>
          <select
            name="categoryId"
            value={product.categoryId}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
            required
          >
            <option value="">Select category</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea
            name="description"
            value={product.description || ""}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
            rows={3}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Dimensions</label>
          <input
            type="text"
            name="dimensions"
            value={product.dimensions || ""}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
            placeholder="ex: 200x80x40 cm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Weight (kg)</label>
          <input
            type="number"
            name="weight"
            value={product.weight || 0}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
            min={0}
            step={0.01}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Image URL</label>
          <input
            type="text"
            name="imageUrl"
            value={product.imageUrl || ""}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
            placeholder="https://..."
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Available Materials</label>
          {materials.length === 0 ? (
            <div className="text-red-500">No materials found in database!</div>
          ) : (
            <Select
              isMulti
              name="availableMaterials"
              value={product.availableMaterials}
              onChange={handleMaterialsChange}
              options={materials.map((mat) => ({ value: String(mat.id), label: mat.name }))}
              className="basic-multi-select"
              classNamePrefix="select"
            />
          )}
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Available Colors</label>
          <input
            type="text"
            name="availableColors"
            value={colorsInput}
            onChange={handleColorsInputChange}
            className="w-full border rounded px-3 py-2"
            placeholder="ex: alb, negru, stejar"
          />
          <p className="text-xs text-gray-500">Separă culorile cu virgulă</p>
        </div>
        <div>
          <label className="inline-flex items-center gap-2">
            <input
              type="checkbox"
              name="isVisible"
              checked={!!product.isVisible}
              onChange={e => setProduct(prev => ({ ...prev, isVisible: e.target.checked }))}
              className="form-checkbox h-4 w-4 text-blue-600"
            />
            Produs vizibil pe site
          </label>
        </div>
        <div className="flex justify-end gap-2">
          <button
            type="button"
            className="px-4 py-2 bg-gray-200 rounded"
            onClick={() => navigate("/admin/products")}
            disabled={saving}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded"
            disabled={saving}
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
        {error && <div className="text-red-600 mt-2">{error}</div>}
      </form>
    </div>
  );
};

export default EditProduct; 