import { useState } from 'react'
import { recommendAPI } from '../../services/api'
import ProductCard from '../../components/ProductCard/ProductCard'
import './ImageSearch.css'

export default function ImageSearch() {
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [results, setResults] = useState([])
  const [isDragActive, setIsDragActive] = useState(false)

  const handleImageSelect = (file) => {
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file')
      return
    }

    setImageFile(file)
    setError('')
    const reader = new FileReader()
    reader.onloadend = () => {
      setImagePreview(reader.result)
    }
    reader.readAsDataURL(file)
  }

  const handleFileInput = (e) => {
    const file = e.target.files?.[0]
    handleImageSelect(file)
  }

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragActive(true)
    } else if (e.type === 'dragleave') {
      setIsDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragActive(false)
    const file = e.dataTransfer.files?.[0]
    handleImageSelect(file)
  }

  const handleSearch = async () => {
    if (!imageFile) {
      setError('Please select an image')
      return
    }

    setLoading(true)
    setError('')
    setResults([])

    try {
      const formData = new FormData()
      formData.append('image', imageFile)

      const response = await recommendAPI.findSimilar(formData)
      const similarProducts = response.data.data || response.data
      setResults(Array.isArray(similarProducts) ? similarProducts : [])
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to find similar products')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setImageFile(null)
    setImagePreview('')
    setError('')
    setResults([])
  }

  return (
    <div className="image-search-container">
      <div className="search-header">
        <h1>Find Similar Products by Image</h1>
        <p>Upload an image to discover similar items in our collection</p>
      </div>

      <div className="search-content">
        <div className="upload-section">
          <div 
            className={`upload-area ${isDragActive ? 'active' : ''}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            {!imagePreview ? (
              <div className="upload-prompt">
                <div className="upload-icon">🖼️</div>
                <h3>Drag and drop your image here</h3>
                <p>or</p>
                <label htmlFor="image-input" className="upload-link">
                  click to select
                </label>
                <input
                  id="image-input"
                  type="file"
                  accept="image/*"
                  onChange={handleFileInput}
                  style={{ display: 'none' }}
                />
              </div>
            ) : (
              <div className="image-preview-wrapper">
                <img src={imagePreview} alt="Preview" className="preview-image" />
                <label htmlFor="image-input-change" className="change-image-btn">
                  Change Image
                </label>
                <input
                  id="image-input-change"
                  type="file"
                  accept="image/*"
                  onChange={handleFileInput}
                  style={{ display: 'none' }}
                />
              </div>
            )}
          </div>

          {error && <div className="error-message">{error}</div>}

          <div className="search-actions">
            <button 
              className="search-btn"
              onClick={handleSearch}
              disabled={!imageFile || loading}
            >
              {loading ? 'Searching...' : 'Search Similar Products'}
            </button>
            {imageFile && (
              <button className="reset-btn" onClick={handleReset}>
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {results.length > 0 && (
        <div className="results-section">
          <h2>Similar Products Found ({results.length})</h2>
          <div className="results-grid">
            {results.map(product => (
              <div key={product.id} className="result-item">
                <ProductCard product={product} />
                {product.similarity && (
                  <div className="similarity-badge">
                    {(product.similarity * 100).toFixed(1)}% match
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {!loading && results.length === 0 && imageFile && !error && (
        <div className="no-results">
          <p>No similar products found. Try a different image.</p>
        </div>
      )}
    </div>
  )
}
