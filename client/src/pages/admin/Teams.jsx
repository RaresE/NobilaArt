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
      <h1 className="text-2xl font-bold mb-4">Teams Management</h1>
      {!showForm && (
        <button className="mb-6 px-4 py-2 bg-blue-600 text-white rounded" onClick={() => { setShowForm(true); setEditingId(null); setForm({ name: "", description: "" }) }}>Add Team</button>
      )}
      {showForm && (
        <form onSubmit={handleSubmit} className="mb-6 space-y-2">
          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <input name="name" value={form.name} onChange={handleChange} required className="w-full border rounded px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <input name="description" value={form.description} onChange={handleChange} className="w-full border rounded px-3 py-2" />
          </div>
          <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded" disabled={saving}>{editingId ? "Update" : "Add"} Team</button>
          <button type="button" className="ml-2 px-4 py-2 bg-gray-300 rounded" onClick={() => { setEditingId(null); setForm({ name: "", description: "" }); setShowForm(false) }}>Cancel</button>
        </form>
      )}
      {error && <div className="text-red-600 mb-2">{error}</div>}
      {loading ? <div>Loading...</div> : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 bg-white shadow rounded-lg mt-4">
            <thead>
              <tr className="bg-gray-50">
                <th className="p-2 text-left">Name</th>
                <th className="p-2 text-left">Description</th>
                <th className="p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {teams.map(team => (
                <tr key={team.id} className="border-b hover:bg-gray-50">
                  <td className="p-2">{team.name}</td>
                  <td className="p-2">{team.description}</td>
                  <td className="p-2 flex gap-2">
                    <button className="text-blue-600" onClick={() => handleEdit(team)}>Edit</button>
                    <button className="text-red-600" onClick={() => handleDelete(team.id)}>Delete</button>
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