"use client"
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import { AuthProvider, useAuth } from "./contexts/AuthContext"

// Client Pages
import Home from "./pages/client/Home"
import Login from "./pages/auth/Login"
import Register from "./pages/auth/Register"
import ProductList from "./pages/client/ProductList"
import ProductDetail from "./pages/client/ProductDetail"
import Cart from "./pages/client/Cart"
import Checkout from "./pages/client/Checkout"
import ClientDashboard from "./pages/client/Dashboard"
import ClientOrders from "./pages/client/Orders"
import OrderDetail from "./pages/client/OrderDetail"

// Admin Pages
import AdminLogin from "./pages/admin/AdminLogin"
import AdminDashboard from "./pages/admin/Dashboard"
import AdminOrders from "./pages/admin/Orders"
import AdminProducts from "./pages/admin/Products"
import AdminInventory from "./pages/admin/Inventory"
import EditProduct from "./pages/admin/EditProduct"
import AddProduct from "./pages/admin/AddProduct"
import Teams from "./pages/admin/Teams"
import AdminOrderDetail from "./pages/admin/AdminOrderDetail"

// Components
import Navbar from "./components/client/Navbar"
import Footer from "./components/client/Footer"
import AdminNavbar from "./components/admin/AdminNavbar"
import AdminSidebar from "./components/admin/AdminSidebar"

// Protected Route Components
const ClientRoute = ({ children }) => {
  const { user, loading } = useAuth()

  if (loading) return <div className="flex justify-center items-center h-screen">Loading...</div>

  if (!user) return <Navigate to="/login" />

  return children
}

const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth()

  if (loading) return <div className="flex justify-center items-center h-screen">Loading...</div>

  if (!user || user.role !== "admin") return <Navigate to="/admin/login" />

  return children
}

function App() {
  const { user } = useAuth()
  const isAdmin = user && user.role === "admin"

  return (
    <Router>
      {isAdmin ? (
        <div className="flex h-screen bg-gray-100">
          <AdminSidebar />
          <div className="flex-1 flex flex-col overflow-hidden">
            <AdminNavbar />
            <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
              <Routes>
                <Route
                  path="/admin/dashboard"
                  element={
                    <AdminRoute>
                      <AdminDashboard />
                    </AdminRoute>
                  }
                />
                <Route
                  path="/admin/orders"
                  element={
                    <AdminRoute>
                      <AdminOrders />
                    </AdminRoute>
                  }
                />
                <Route
                  path="/admin/products"
                  element={
                    <AdminRoute>
                      <AdminProducts />
                    </AdminRoute>
                  }
                />
                <Route
                  path="/admin/inventory"
                  element={
                    <AdminRoute>
                      <AdminInventory />
                    </AdminRoute>
                  }
                />
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route path="/admin/*" element={<Navigate to="/admin/dashboard" />} />
                <Route path="/admin/products/:id/edit" element={<EditProduct />} />
                <Route path="/admin/products/new" element={<AddProduct />} />
                <Route path="/admin/teams" element={<Teams />} />
                <Route
                  path="/admin/orders/:id"
                  element={
                    <AdminRoute>
                      <AdminOrderDetail />
                    </AdminRoute>
                  }
                />
              </Routes>
            </main>
          </div>
        </div>
      ) : (
        <div className="flex flex-col min-h-screen">
          <Navbar />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route
                path="/products"
                element={
                  <ClientRoute>
                    <ProductList />
                  </ClientRoute>
                }
              />
              <Route
                path="/products/:id"
                element={
                  <ClientRoute>
                    <ProductDetail />
                  </ClientRoute>
                }
              />
              <Route
                path="/cart"
                element={
                  <ClientRoute>
                    <Cart />
                  </ClientRoute>
                }
              />
              <Route
                path="/checkout"
                element={
                  <ClientRoute>
                    <Checkout />
                  </ClientRoute>
                }
              />
              <Route
                path="/dashboard"
                element={
                  <ClientRoute>
                    <ClientDashboard />
                  </ClientRoute>
                }
              />
              <Route
                path="/orders"
                element={
                  <ClientRoute>
                    <ClientOrders />
                  </ClientRoute>
                }
              />
              <Route
                path="/orders/:id"
                element={
                  <ClientRoute>
                    <OrderDetail />
                  </ClientRoute>
                }
              />
              <Route path="/admin/*" element={<Navigate to="/admin/login" />} />
            </Routes>
          </main>
          <Footer />
        </div>
      )}
    </Router>
  )
}

function AppWithAuth() {
  return (
    <AuthProvider>
      <App />
    </AuthProvider>
  )
}

export default AppWithAuth
