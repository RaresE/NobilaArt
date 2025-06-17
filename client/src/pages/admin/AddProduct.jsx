import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Select from "react-select";

const AddProduct = () => {
  const navigate = useNavigate();
  const [product, setProduct] = useState({
    name: "",
    price: "",
    stock: "",
    categoryId: "",
    description: "",
    dimensions: "",
    weight: "",
    imageUrl: "",
    availableMaterials: [],
  });
  const [categories, setCategories] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [colorsInput, setColorsInput] = useState("");
  const [specifications, setSpecifications] = useState([{ key: '', value: '' }]);

  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true);
      try {
        const [catRes, matRes] = await Promise.all([
          axios.get("http://localhost:5000/api/categories"),
          axios.get("http://localhost:5000/api/admin/materials"),
        ]);
        setCategories(catRes.data);
        setMaterials(matRes.data);
      } catch (err) {
        setError("Failed to load categories or materials");
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

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

  const handleSpecificationChange = (index, field, val) => {
    setSpecifications((prev) => prev.map((spec, i) => i === index ? { ...spec, [field]: val } : spec));
  };

  const handleAddSpecification = () => {
    setSpecifications((prev) => [...prev, { key: '', value: '' }]);
  };

  const handleRemoveSpecification = (index) => {
    setSpecifications((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    let specificationsObj = {};
    for (const spec of specifications) {
      if (spec.key.trim() !== '') {
        specificationsObj[spec.key] = spec.value;
      }
    }
    try {
      const payload = {
        ...product,
        price: product.price === "" ? 0 : Number(product.price),
        stock: product.stock === "" ? 0 : Number(product.stock),
        weight: product.weight === "" ? 0 : Number(product.weight),
        availableMaterials: (product.availableMaterials || []).map(opt => opt.value),
        availableColors: colorsInput.split(",").map(c => c.trim()).filter(Boolean),
        specifications: Object.keys(specificationsObj).length > 0 ? specificationsObj : undefined,
      };
      await axios.post("http://localhost:5000/api/admin/products", payload);
      navigate("/admin/products");
    } catch (err) {
      setError("Failed to add product. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="max-w-xl mx-auto bg-white p-8 rounded shadow mt-8">
      <h1 className="text-2xl font-bold mb-4">Adaugă Produs Nou</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="border border-gray-300 rounded-md bg-gray-50 p-4 mb-2">
          <label className="block text-sm font-medium mb-1">Denumire</label>
          <input
            type="text"
            name="name"
            value={product.name}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
            required
          />
        </div>
        <div className="border border-gray-300 rounded-md bg-gray-50 p-4 mb-2">
          <label className="block text-sm font-medium mb-1">Preț</label>
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
        <div className="border border-gray-300 rounded-md bg-gray-50 p-4 mb-2">
          <label className="block text-sm font-medium mb-1">Stoc</label>
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
        <div className="border border-gray-300 rounded-md bg-gray-50 p-4 mb-2">
          <label className="block text-sm font-medium mb-1">Categorie</label>
          <select
            name="categoryId"
            value={product.categoryId}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
            required
          >
            <option value="">Selectează categoria</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
        <div className="border border-gray-300 rounded-md bg-gray-50 p-4 mb-2">
          <label className="block text-sm font-medium mb-1">Descriere</label>
          <textarea
            name="description"
            value={product.description}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
            rows={3}
          />
        </div>
        <div className="border border-gray-300 rounded-md bg-gray-50 p-4 mb-2">
          <label className="block text-sm font-medium mb-1">Dimensiuni</label>
          <input
            type="text"
            name="dimensions"
            value={product.dimensions}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
            placeholder="ex: 200x80x40 cm"
          />
        </div>
        <div className="border border-gray-300 rounded-md bg-gray-50 p-4 mb-2">
          <label className="block text-sm font-medium mb-1">Greutate (kg)</label>
          <input
            type="number"
            name="weight"
            value={product.weight}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
            min={0}
            step={0.01}
          />
        </div>
        <div className="border border-gray-300 rounded-md bg-gray-50 p-4 mb-2">
          <label className="block text-sm font-medium mb-1">URL Imagine</label>
          <input
            type="text"
            name="imageUrl"
            value={product.imageUrl}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
            placeholder="https://..."
          />
        </div>
        <div className="border border-gray-300 rounded-md bg-gray-50 p-4 mb-2">
          <label className="block text-sm font-medium mb-1">Materiale Disponibile</label>
          <Select
            isMulti
            name="availableMaterials"
            value={product.availableMaterials}
            onChange={handleMaterialsChange}
            options={materials.map((mat) => ({ value: String(mat.id), label: mat.name }))}
            className="basic-multi-select"
            classNamePrefix="select"
          />
        </div>
        <div className="border border-gray-300 rounded-md bg-gray-50 p-4 mb-2">
          <label className="block text-sm font-medium mb-1">Culori Disponibile</label>
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
        <div className="border border-gray-300 rounded-md bg-gray-50 p-4 mb-2">
          <label className="block text-sm font-medium mb-1">Specificații</label>
          {specifications.map((spec, idx) => (
            <div key={idx} className="flex gap-2 mb-2">
              <input
                type="text"
                placeholder="Cheie (ex: locuri)"
                value={spec.key}
                onChange={e => handleSpecificationChange(idx, 'key', e.target.value)}
                className="border rounded px-2 py-1 flex-1"
              />
              <input
                type="text"
                placeholder="Valoare (ex: 3)"
                value={spec.value}
                onChange={e => handleSpecificationChange(idx, 'value', e.target.value)}
                className="border rounded px-2 py-1 flex-1"
              />
              <button type="button" onClick={() => handleRemoveSpecification(idx)} className="px-2 text-red-600 font-bold">&times;</button>
            </div>
          ))}
          <button type="button" onClick={handleAddSpecification} className="text-blue-600 text-sm mt-1">+ Adaugă specificație</button>
          <p className="text-xs text-gray-500 mt-1">Exemplu: locuri = 3, material = Lemn</p>
        </div>
        <div className="flex justify-end gap-2">
          <button
            type="button"
            className="px-4 py-2 bg-gray-200 rounded"
            onClick={() => navigate("/admin/products")}
            disabled={saving}
          >
            Anulează
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded"
            disabled={saving}
          >
            {saving ? "Se salvează..." : "Adaugă Produs"}
          </button>
        </div>
        {error && <div className="text-red-600 mt-2">{error}</div>}
      </form>
    </div>
  );
};

export default AddProduct; 