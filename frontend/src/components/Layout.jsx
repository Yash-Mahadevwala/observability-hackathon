export default function Layout({ children }) {
  return (
    <div className="flex min-h-screen bg-gray-100">

      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg p-5">

        <h2 className="text-xl font-bold mb-6">
          Observability App
        </h2>

        <nav className="space-y-3">
          <a className="block hover:text-blue-600">Dashboard</a>
          {/* <a className="block hover:text-blue-600">Users</a>
          <a className="block hover:text-blue-600">Products</a>
          <a className="block hover:text-blue-600">Orders</a> */}
        </nav>

      </div>

      {/* Main Content */}
      <div className="flex-1 p-10">
        {children}
      </div>

    </div>
  );
}