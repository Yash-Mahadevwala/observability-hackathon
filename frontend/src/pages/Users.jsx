import { useState, useEffect } from "react"
import api from "../api/api"

export default function Users() {
  const [users, setUsers] = useState([])
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")

  const loadUsers = async () => {
    const res = await api.get("/users")
    setUsers(res.data || [])
  }

  const createUser = async (e) => {
    e.preventDefault()

    if (!name.trim() || !email.trim()) {
      alert("Name and email are required.")
      return
    }

    try {
      await api.post("/users", {
        name,
        email,
        password: "123456"
      })

      setName("")
      setEmail("")

      loadUsers()
    } catch (error) {
      const errData = error.response?.data
      if (errData?.errors) {
        alert("Errors:\n" + errData.errors.map(e => `- ${e.field}: ${e.message}`).join("\n"))
      } else {
        alert("Error creating user: " + (errData?.message || error.message))
      }
    }
  }

  const deleteUser = async (id) => {
    if (!confirm("Delete this user?")) return
    try {
      await api.delete(`/users/${id}`)
      loadUsers()
    } catch (error) {
      alert("Error deleting user: " + (error.response?.data?.message || error.message))
    }
  }

  useEffect(() => {
    loadUsers()
  }, [])

  return (
    <div className="bg-white p-5 rounded-lg shadow">

      <h2 className="text-lg font-semibold mb-4">Users</h2>

      <form className="flex gap-2 mb-4" onSubmit={createUser}>

        <input
          required
          className="border rounded p-2 flex-1"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          required
          type="email"
          className="border rounded p-2 flex-1"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <button
          type="submit"
          className="bg-blue-500 text-white px-4 rounded hover:bg-blue-600 transition-colors"
        >
          Add
        </button>

      </form>

      <div className="space-y-2">

        {users.map((u) => (
          <div
            key={u.id}
            className="border p-2 rounded flex justify-between items-center"
          >
            <span>{u.name} — {u.email}</span>
            <button
              onClick={() => deleteUser(u.id)}
              className="text-red-500 hover:text-red-700 text-sm font-medium transition-colors"
            >
              Delete
            </button>
          </div>
        ))}

      </div>

    </div>
  )
}