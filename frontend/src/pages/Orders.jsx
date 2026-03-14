import { useState, useEffect } from "react"
import api from "../api/api"

export default function Orders() {
  const [orders, setOrders] = useState([])
  const [users, setUsers] = useState([])
  const [products, setProducts] = useState([])

  const [selectedUser, setSelectedUser] = useState("")
  const [items, setItems] = useState([{ product_id: "", quantity: 1 }])

  const loadData = async () => {
    try {
      const [ordersRes, usersRes, productsRes] = await Promise.all([
        api.get("/orders"),
        api.get("/users"),
        api.get("/products")
      ])
      setOrders(ordersRes.data || [])
      setUsers(usersRes.data || [])
      setProducts(productsRes.data || [])
    } catch (error) {
      console.error("Error fetching data:", error)
    }
  }

  const handleAddItem = () => {
    setItems([...items, { product_id: "", quantity: 1 }])
  }

  const handleItemChange = (index, field, value) => {
    const newItems = [...items]
    newItems[index][field] = value
    setItems(newItems)
  }

  const handleRemoveItem = (index) => {
    const newItems = items.filter((_, i) => i !== index)
    setItems(newItems)
  }

  const createOrder = async (e) => {
    e.preventDefault()

    if (!selectedUser) {
      alert("Please select a user.")
      return
    }

    const formattedItems = items.map(item => ({
      product_id: Number(item.product_id),
      quantity: Number(item.quantity)
    }))

    if (formattedItems.length === 0) {
      alert("Please add at least one item.")
      return
    }

    try {
      await api.post("/orders", {
        user_id: Number(selectedUser),
        items: formattedItems
      })

      // Reset form on success
      setSelectedUser("")
      setItems([{ product_id: "", quantity: 1 }])

      // Reload orders
      const res = await api.get("/orders")
      setOrders(res.data || [])

    } catch (error) {
      const errData = error.response?.data
      if (errData?.errors) {
        alert("Errors:\n" + errData.errors.map(err => `- ${err.field}: ${err.message}`).join("\n"))
      } else {
        alert("Error creating order: " + (errData?.message || error.message))
      }
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  return (
    <div className="bg-white p-5 rounded-lg shadow">
      <h2 className="text-lg font-semibold mb-4">Orders</h2>

      <form className="mb-6 p-4 border rounded bg-gray-50" onSubmit={createOrder}>
        <div className="mb-4">
          <label className="block mb-1 font-medium text-sm">Select User</label>
          <select
            className="border rounded p-2 w-full"
            value={selectedUser}
            onChange={(e) => setSelectedUser(e.target.value)}
            required
          >
            <option value="">-- Choose User --</option>
            {users.map(u => (
              <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
            ))}
          </select>
        </div>

        <div className="mb-4">
          <label className="block mb-1 font-medium text-sm">Items</label>
          {items.map((item, index) => (
            <div key={index} className="flex gap-2 mb-2">
              <select
                className="border rounded p-2 flex-1"
                value={item.product_id}
                onChange={(e) => handleItemChange(index, "product_id", e.target.value)}
                required
              >
                <option value="">-- Choose Product --</option>
                {products.map(p => (
                  <option key={p.id} value={p.id}>{p.name} - ${p.price}</option>
                ))}
              </select>

              <input
                type="number"
                min="1"
                className="border rounded p-2 w-24"
                placeholder="Qty"
                value={item.quantity}
                onChange={(e) => handleItemChange(index, "quantity", e.target.value)}
                required
              />

              {items.length > 1 && (
                <button
                  type="button"
                  className="bg-red-500 text-white px-3 rounded hover:bg-red-600"
                  onClick={() => handleRemoveItem(index)}
                >
                  X
                </button>
              )}
            </div>
          ))}

          <button
            type="button"
            className="text-sm text-blue-500 hover:underline mt-1"
            onClick={handleAddItem}
          >
            + Add another item
          </button>
        </div>

        <button
          type="submit"
          className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 transition-colors w-full"
        >
          Create Order
        </button>
      </form>

      <div className="space-y-2">
        <h3 className="font-semibold text-gray-700">Order History</h3>
        {orders.length === 0 && <p className="text-gray-500 text-sm">No orders found.</p>}
        {orders.map((o) => (
          <div key={o.id} className="border p-3 rounded">
            <strong>Order #{o.id}</strong>
            <p className="text-sm text-gray-600 mt-1">
              User ID: {o.user_id}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}