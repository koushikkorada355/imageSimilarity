import { useNavigate } from 'react-router-dom'
import './ProductCard.css'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000'

export default function ProductCard({ product }) {
  const navigate = useNavigate()
  
  // Construct full image URL - use imageurl (lowercase) from database
  const imageUrl = product.imageurl 
    ? (product.imageurl.startsWith('http') ? product.imageurl : `${API_BASE}/${product.imageurl}`)
    : `${API_BASE}/uploads/placeholder.png`

  return (
    <div className="product-card">
      <div className="product-image">
        <img src={imageUrl} alt={product.name} onError={(e) => { e.target.src = `${API_BASE}/uploads/placeholder.png` }} />
      </div>
      <div className="product-info">
        <p className="product-category">{product.category}</p>
        <h3 className="product-name">{product.name}</h3>
        <p className="product-price">${product.price !== undefined && product.price !== null ? Number(product.price).toFixed(2) : '0.00'}</p>
        <button 
          className="view-btn"
          onClick={() => navigate(`/products/${product.id}`)}
        >
          View Details
        </button>
      </div>
    </div>
  )
}
