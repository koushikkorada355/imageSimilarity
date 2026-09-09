import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'

import Navbar from './components/Navbar/Navbar'
import Login from './pages/Login/Login'
import Signup from './pages/Signup/Signup'
import Home from './pages/Home/Home'
import Products from './pages/Products/Products'
import ProductDetails from './pages/ProductDetails/ProductDetails'
import ImageSearch from './pages/ImageSearch/ImageSearch'
import AdminDashboard from './pages/Admin/Dashboard/Dashboard'
import AdminProducts from './pages/Admin/Products/Products'
import AdminProductForm from './pages/Admin/ProductForm/ProductForm'

import './App.css'

function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('auth_token')
    const userData = localStorage.getItem('user')
    if (token && userData) {
      setUser(JSON.parse(userData))
    }
    setLoading(false)
  }, [])

  const handleLogin = (userData, token) => {
    setUser(userData)
    localStorage.setItem('auth_token', token)
    localStorage.setItem('user', JSON.stringify(userData))
  }

  const handleLogout = () => {
    setUser(null)
    localStorage.removeItem('auth_token')
    localStorage.removeItem('user')
  }

  if (loading) {
    return <div className="loading">Loading...</div>
  }

  const ProtectedRoute = ({ children, adminOnly = false }) => {
    if (!user) {
      return <Navigate to="/login" />
    }
    if (adminOnly && user.role !== 'admin') {
      return <Navigate to="/" />
    }
    return children
  }

  return (
    <Router>
      <Navbar user={user} onLogout={handleLogout} />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={user ? <Navigate to="/" /> : <Login onLogin={handleLogin} />} />
        <Route path="/signup" element={user ? <Navigate to="/" /> : <Signup />} />
        <Route path="/products" element={<Products />} />
        <Route path="/products/:id" element={<ProductDetails />} />
        <Route path="/find-similar" element={<ImageSearch />} />

        <Route
          path="/admin"
          element={
            // <ProtectedRoute adminOnly>
              <AdminDashboard />
            // </ProtectedRoute>
          }
        />
        <Route
          path="/admin/products"
          element={
            // <ProtectedRoute adminOnly>
              <AdminProducts />
            // </ProtectedRoute>
          }
        />
        <Route
          path="/admin/products/add"
          element={
            // <ProtectedRoute adminOnly>
              <AdminProductForm />
            // </ProtectedRoute>
          }
        />
        <Route
          path="/admin/products/edit/:id"
          element={
            // <ProtectedRoute adminOnly>
              <AdminProductForm />
            // </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  )
}

export default App
