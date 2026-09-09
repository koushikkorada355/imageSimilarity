import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { adminAPI, productAPI } from '../../../services/api'
import './Dashboard.css'

export default function AdminDashboard() {
  const navigate = useNavigate()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      setLoading(true)
      const response = await productAPI.getAll()
      const products = response.data.data || response.data
      
      setStats({
        totalProducts: products.length,
        indexedProducts: products.length,
        categories: [...new Set(products.map(p => p.category))].length
      })
    } catch (err) {
      setError('Failed to load statistics')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="loading">Loading dashboard...</div>
  }

  if (error) {
    return <div className="error-message">{error}</div>
  }

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <h1>Admin Dashboard</h1>
        <p>Manage your product catalog</p>
      </div>

      {stats && (
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-label">Total Products</div>
            <div className="stat-value">{stats.totalProducts}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Indexed Products</div>
            <div className="stat-value">{stats.indexedProducts}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Categories</div>
            <div className="stat-value">{stats.categories}</div>
          </div>
        </div>
      )}

      <div className="dashboard-actions">
        <button 
          className="action-btn"
          onClick={() => navigate('/admin/products')}
        >
          Manage Products
        </button>
        <button 
          className="action-btn add-btn"
          onClick={() => navigate('/admin/products/add')}
        >
          Add New Product
        </button>
      </div>
    </div>
  )
}
