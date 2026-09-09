import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { productAPI, adminAPI } from '../../../services/api'
import './Products.css'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000'

export default function AdminProducts() {
  const navigate = useNavigate()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const response = await productAPI.getAll()
      const productsData = response.data.data || response.data
      setProducts(Array.isArray(productsData) ? productsData : [])
    } catch (err) {
      setError('Failed to load products')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (productId) => {
    try {
      await adminAPI.deleteProduct(productId)
      setProducts(products.filter(p => p.id !== productId))
      setDeleteConfirm(null)
      alert('Product deleted successfully')
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete product')
      console.error(err)
    }
  }

  if (loading) {
    return <div className="loading">Loading products...</div>
  }

  return (
    <div className="admin-products">
      <div className="admin-header">
        <h1>Manage Products</h1>
        <button 
          className="add-btn"
          onClick={() => navigate('/admin/products/add')}
        >
          Add Product
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {products.length === 0 ? (
        <p className="no-products">No products found</p>
      ) : (
        <div className="products-table-wrapper">
          <table className="products-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Price</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map(product => {
                const imageUrl = product.imageurl 
                  ? (product.imageurl.startsWith('http') ? product.imageurl : `${API_BASE}/${product.imageurl}`)
                  : `${API_BASE}/uploads/placeholder.png`
                return (
                  <tr key={product.id}>
                    <td>
                      <div className="product-cell">
                        <img src={imageUrl} alt={product.name} onError={(e) => { e.target.src = `${API_BASE}/uploads/placeholder.png` }} />
                        <span>{product.name}</span>
                      </div>
                    </td>
                    <td>{product.category}</td>
                    <td>${product.price !== undefined && product.price !== null ? Number(product.price).toFixed(2) : '0.00'}</td>
                    <td>
                      <div className="action-buttons">
                        <button 
                          className="edit-btn"
                          onClick={() => navigate(`/admin/products/edit/${product.id}`)}
                        >
                          Edit
                        </button>
                        <button 
                          className="delete-btn"
                          onClick={() => setDeleteConfirm(product.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {deleteConfirm && (
        <div className="confirm-modal">
          <div className="modal-content">
            <h3>Delete Product?</h3>
            <p>This action cannot be undone.</p>
            <div className="modal-buttons">
              <button 
                className="cancel-btn"
                onClick={() => setDeleteConfirm(null)}
              >
                Cancel
              </button>
              <button 
                className="confirm-delete-btn"
                onClick={() => handleDelete(deleteConfirm)}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
