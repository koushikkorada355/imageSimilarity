import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { productAPI } from '../../services/api'
import './ProductDetails.css'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000'

export default function ProductDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchProduct()
  }, [id])

  const fetchProduct = async () => {
    try {
      setLoading(true)
      const response = await productAPI.getById(id)
      setProduct(response.data.data || response.data)
    } catch (err) {
      setError('Failed to load product')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="loading">Loading product...</div>
  }

  if (error || !product) {
    return (
      <div className="error-container">
        <p className="error-message">{error || 'Product not found'}</p>
        <button className="back-btn" onClick={() => navigate('/products')}>
          Back to Products
        </button>
      </div>
    )
  }

  // Construct full image URL - use imageurl (lowercase) from database
  const imageUrl = product.imageurl 
    ? (product.imageurl.startsWith('http') ? product.imageurl : `${API_BASE}/${product.imageurl}`)
    : `${API_BASE}/uploads/placeholder.png`

  return (
    <div className="product-details-container">
      <button className="back-btn" onClick={() => navigate('/products')}>
        ← Back to Products
      </button>

      <div className="product-details">
        <div className="product-image-section">
          <img src={imageUrl} alt={product.name} />
        </div>

        <div className="product-info-section">
          <p className="product-category">{product.category}</p>
          <h1 className="product-name">{product.name}</h1>
          <p className="product-price">${product.price !== undefined && product.price !== null ? Number(product.price).toFixed(2) : '0.00'}</p>

          {product.description && (
            <div className="product-description">
              <h3>Description</h3>
              <p>{product.description}</p>
            </div>
          )}

          <div className="product-metadata">
            <div className="metadata-item">
              <span className="label">Category</span>
              <span className="value">{product.category}</span>
            </div>
            <div className="metadata-item">
              <span className="label">Product ID</span>
              <span className="value">{product.id}</span>
            </div>
          </div>

          <div className="action-buttons">
            <button 
              className="similar-products-btn"
              onClick={() => navigate('/find-similar', { state: { productId: product.id } })}
            >
              Find Similar Products
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
