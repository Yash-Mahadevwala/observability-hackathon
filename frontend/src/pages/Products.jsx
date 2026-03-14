import { useState, useEffect } from "react"
import api from "../api/api"

export default function Products() {
  const [products, setProducts] = useState([])
  const [name, setName] = useState("")
  const [price, setPrice] = useState("")

  const loadProducts = async () => {
    const res = await api.get("/products")
    setProducts(res.data || [])
  }

  const createProduct = async (e) => {
    e.preventDefault()

    if (!name.trim() || !price || isNaN(price) || Number(price) <= 0) {
      alert("Please enter a valid product name and positive price.")
      return
    }

    try {
      await api.post("/products", {
        name,
        price: Number(price),
        stock: 10
      })

      setName("")
      setPrice("")

      loadProducts()
    } catch (error) {
      const errData = error.response?.data
      if (errData?.errors) {
        alert("Errors:\n" + errData.errors.map(e => `- ${e.field}: ${e.message}`).join("\n"))
      } else {
        alert("Error creating product: " + (errData?.message || error.message))
      }
    }
  }

  const deleteProduct = async (id) => {
    if (!confirm("Delete this product?")) return
    try {
      await api.delete(`/products/${id}`)
      loadProducts()
    } catch (error) {
      alert("Error deleting product: " + (error.response?.data?.message || error.message))
    }
  }

  useEffect(() => {
    loadProducts()
  }, [])

  return (
    <div className="bg-white p-5 rounded-lg shadow">

      <h2 className="text-lg font-semibold mb-4">Products</h2>

      <form className="flex gap-2 mb-4" onSubmit={createProduct}>

        <input
          required
          className="border rounded p-2 flex-1"
          placeholder="Product"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          required
          type="number"
          min="0.01"
          step="0.01"
          className="border rounded p-2 flex-1"
          placeholder="Price"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
        />

        <button
          type="submit"
          className="bg-green-500 text-white px-4 rounded hover:bg-green-600 transition-colors"
        >
          Add
        </button>

      </form>

      <div className="space-y-2">

        {products.map((p) => (
          <div
            key={p.id}
            className="border p-2 rounded flex justify-between items-center"
          >
            <span>{p.name}</span>
            <div className="flex items-center gap-4">
              <span className="text-gray-600">${p.price}</span>
              <button
                onClick={() => deleteProduct(p.id)}
                className="text-red-500 hover:text-red-700 text-sm font-medium transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        ))}

      </div>

    </div>
  )
}