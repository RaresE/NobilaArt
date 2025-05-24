import { useState, useEffect } from "react"
import axios from "axios"

const Teams = () => {
  const [teams, setTeams] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [form, setForm] = useState({ name: "", description: "" })
  const [editingId, setEditingId] = useState(null)
  const [saving, setSaving] = useState(false)
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    fetchTeams()
  }, [])

  const fetchTeams = async () => {
    setLoading(true)
    try {
      const res = await axios.get("http://localhost:5000/api/admin/teams")
      setTeams(res.data)
    } catch {
      setError("Failed to load teams")
    } finally {
      setLoading(false)
    }
  }

  const handleChange = e => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async e => {
    e.preventDefault()
    setSaving(true)
    try {
      if (editingId) {
        await axios.put(`http://localhost:5000/api/admin/teams/${editingId}`, form)
      } else {
        await axios.post("http://localhost:5000/api/admin/teams", form)
      }
      setForm({ name: "", description: "" })
      setEditingId(null)
      setShowForm(false)
      fetchTeams()
    } catch {
      setError("Failed to save team")
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = team => {
    setForm({ name: team.name, description: team.description || "" })
    setEditingId(team.id)
    setShowForm(true)
  }

  const handleDelete = async id => {
    if (!window.confirm("Are you sure?")) return
    try {
      await axios.delete(`http://localhost:5000/api/admin/teams/${id}`)
      fetchTeams()
    } catch {
      setError("Failed to delete team")
    }
  }

  return (
    <div className="w-full p-8 bg-white rounded shadow mt-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Gestionare echipe</h1>
        <p className="mt-1 text-sm text-gray-500">Adaugă, editează și gestionează echipele de angajați</p>
      </div>
      {!showForm && (
        <button className="mb-6 px-4 py-2 bg-blue-600 text-white rounded" onClick={() => { setShowForm(true); setEditingId(null); setForm({ name: "", description: "" }) }}>Adaugă echipă</button>
      )}
      {showForm && (
        <form onSubmit={handleSubmit} className="mb-6 space-y-2">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nume echipă</label>
              <input type="text" name="name" id="name" required value={form.name} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm" />
            </div>
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">Descriere</label>
              <input type="text" name="description" id="description" value={form.description} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm" />
            </div>
          </div>
          <div className="mt-6 flex justify-end space-x-3">
            <button type="button" onClick={() => { setEditingId(null); setForm({ name: "", description: "" }); setShowForm(false) }} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">Renunță</button>
            <button type="submit" disabled={saving} className={`px-4 py-2 text-sm font-medium text-white border border-transparent rounded-md shadow-sm ${saving ? "bg-blue-400" : "bg-blue-600 hover:bg-blue-700"} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}>{saving ? "Se salvează..." : "Actualizează echipa"}</button>
          </div>
        </form>
      )}
      {error && <div className="text-red-600 mb-2">{error === "Failed to load teams" ? "Eroare la încărcarea echipelor" : error === "Failed to save team" ? "Eroare la salvare echipă" : error === "Failed to delete team" ? "Eroare la ștergere echipă" : error}</div>}
      {loading ? <div>Se încarcă...</div> : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 bg-white shadow rounded-lg mt-4">
            <thead>
              <tr className="bg-gray-50">
                <th className="p-2 text-left">Nume echipă</th>
                <th className="p-2 text-left">Descriere</th>
                <th className="p-2">Acțiuni</th>
              </tr>
            </thead>
            <tbody>
              {teams.map(team => (
                <tr key={team.id} className="border-b hover:bg-gray-50">
                  <td className="p-2">{team.name}</td>
                  <td className="p-2">{team.description || "Fără descriere"}</td>
                  <td className="p-2 flex gap-2">
                    <button className="text-blue-600" onClick={() => handleEdit(team)}>Editează</button>
                    <button className="text-red-600" onClick={() => handleDelete(team.id)}>Șterge</button>
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

export default Teams 