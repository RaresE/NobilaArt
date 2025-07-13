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
        <button
          className="mb-6 inline-flex items-center gap-2 px-6 py-2 rounded-full bg-gradient-to-r from-blue-500 to-blue-700 text-white font-semibold shadow-lg hover:from-blue-600 hover:to-blue-800 transition focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 text-base"
          onClick={() => { setShowForm(true); setEditingId(null); setForm({ name: "", description: "" }) }}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 4v16m8-8H4"/></svg>
          Adaugă echipă
        </button>
      )}
      {showForm && (
        <form onSubmit={handleSubmit} className="mb-6 space-y-2">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div className="border border-gray-300 rounded-md bg-gray-50 p-4 mb-2">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">Denumire echipă</label>
              <input type="text" name="name" id="name" required value={form.name} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm" />
            </div>
            <div className="border border-gray-300 rounded-md bg-gray-50 p-4 mb-2">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">Descriere</label>
              <input type="text" name="description" id="description" value={form.description} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm" />
            </div>
          </div>
          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => { setEditingId(null); setForm({ name: "", description: "" }); setShowForm(false) }}
              className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-gray-200 text-gray-800 font-semibold shadow hover:bg-gray-300 transition focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 text-base"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12"/></svg>
              Anulează
            </button>
            <button
              type="submit"
              disabled={saving}
              className={`inline-flex items-center gap-2 px-6 py-2 rounded-full bg-gradient-to-r from-blue-500 to-blue-700 text-white font-semibold shadow-lg hover:from-blue-600 hover:to-blue-800 transition focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 text-base ${saving ? 'opacity-60 cursor-not-allowed' : ''}`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 4v16m8-8H4"/></svg>
              {saving ? "Se salvează..." : "Actualizează echipa"}
            </button>
          </div>
        </form>
      )}
      {error && <div className="text-red-600 mb-2">{error === "Failed to load teams" ? "Eroare la încărcarea echipelor" : error === "Failed to save team" ? "Eroare la salvare echipă" : error === "Failed to delete team" ? "Eroare la ștergere echipă" : error}</div>}
      {loading ? <div>Se încarcă...</div> : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white shadow-lg rounded-xl border-2 border-solid border-gray-400 mt-4">
            <thead>
              <tr className="bg-blue-50">
                <th className="p-4 text-left font-semibold text-gray-700 rounded-tl-xl border-r-2 border-b-2 border-gray-300">Nume echipă</th>
                <th className="p-4 text-left font-semibold text-gray-700 border-r-2 border-b-2 border-gray-300">Descriere</th>
                <th className="p-4 font-semibold text-gray-700 rounded-tr-xl border-b-2 border-gray-300">Acțiuni</th>
              </tr>
            </thead>
            <tbody>
              {teams.map((team, idx) => (
                <tr
                  key={team.id}
                  className={`border-b-2 border-gray-300 transition-all duration-200
                    ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                    ${idx !== 0 ? 'hover:shadow-2xl hover:border-2 hover:border-blue-400 hover:-translate-y-1 hover:bg-blue-50' : 'hover:shadow-2xl hover:-translate-y-1 hover:bg-blue-50'}`}
                >
                  <td className="p-4 text-gray-900 text-base border-r-2 border-gray-300">{team.name}</td>
                  <td className="p-4 text-gray-700 text-base border-r-2 border-gray-300">{team.description || "Fără descriere"}</td>
                  <td className="p-4 text-sm font-medium">
                    <div className="flex space-x-2">
                      <button className="text-blue-600 hover:text-blue-900 font-semibold" onClick={() => handleEdit(team)}>Editează</button>
                      <button className="text-red-600 hover:text-red-900 font-semibold" onClick={() => handleDelete(team.id)}>Șterge</button>
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

export default Teams 