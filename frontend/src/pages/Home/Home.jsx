import { useNavigate } from 'react-router-dom'
import './Home.css'

export default function Home() {
  const navigate = useNavigate()

  return (
    <div className="home-container">
      <section className="hero">
        <div className="hero-content">
          <h1>Welcome to ShopLens</h1>
          <p>Discover products that match your style</p>
          <button 
            className="cta-btn"
            onClick={() => navigate('/products')}
          >
            Browse Products
          </button>
        </div>
      </section>

      <section className="features">
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">📦</div>
            <h3>Explore Collection</h3>
            <p>Browse through our vast collection of products</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🔍</div>
            <h3>Find Similar Items</h3>
            <p>Upload an image to find similar products instantly</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">⚡</div>
            <h3>Smart Recommendations</h3>
            <p>Get AI-powered product recommendations</p>
          </div>
        </div>
      </section>

      <section className="cta-section">
        <h2>Ready to start shopping?</h2>
        <div className="cta-buttons">
          <button 
            className="primary-btn"
            onClick={() => navigate('/products')}
          >
            Browse All Products
          </button>
          <button 
            className="secondary-btn"
            onClick={() => navigate('/find-similar')}
          >
            Search by Image
          </button>
        </div>
      </section>
    </div>
  )
}
