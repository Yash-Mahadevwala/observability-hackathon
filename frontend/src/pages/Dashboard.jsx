import Users from "./Users"
import Products from "./Products"
import Orders from "./Orders"

export default function Dashboard() {

  return (
    <div>

      <h1 className="text-3xl font-bold mb-8">
        Observability Dashboard
      </h1>

      <div className="grid grid-cols-3 gap-6">

        <Users />

        <Products />

        <Orders />

      </div>

    </div>
  )
}