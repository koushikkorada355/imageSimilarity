import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { productAPI, adminAPI } from '../../../services/api'
import './ProductForm.css'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000'

export default function AdminProductForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  
  const [form, setForm] = useState({
    name: '',
    price: '',
    category: '',
    description: '',
    imageurl: ''
  })
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState('')
  const [loading, setLoading] = useState(id ? true : false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [categories, setCategories] = useState([])

  useEffect(() => {
    fetchCategories()
    if (id) {
      fetchProduct()
    }
  }, [id])

  const fetchCategories = async () => {
    try {
      const response = await productAPI.getAll()
      const products = response.data.data || response.data
      const uniqueCategories = [...new Set(products.map(p => p.category))]
      setCategories(uniqueCategories)
    } catch (err) {
      console.error('Failed to fetch categories', err)
    }
  }

  const fetchProduct = async () => {
    try {
      const response = await productAPI.getById(id)
      const product = response.data.data || response.data
      setForm({
        name: product.name,
        price: product.price,
        category: product.category,
        description: product.description || '',
        imageurl: product.imageurl
      })
      // Construct full image URL for preview - handle both placeholder URLs and local paths
      const imageUrl = product.imageurl 
        ? (product.imageurl.startsWith('http') ? product.imageurl : `${API_BASE}/${product.imageurl}`)
        : ''
      setImagePreview(imageUrl)
    } catch (err) {
      setError('Failed to load product')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

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

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)

    if (!form.name || !form.price || !form.category) {
      setError('Name, price, and category are required')
      setSubmitting(false)
      return
    }

    try {
      const formData = new FormData()
      formData.append('name', form.name)
      formData.append('price', parseFloat(form.price))
      formData.append('category', form.category)
      formData.append('description', form.description)

      if (imageFile) {
        formData.append('image', imageFile)
      }

      if (id) {
        await adminAPI.updateProduct(id, formData)
        alert('Product updated successfully')
      } else {
        await adminAPI.createProduct(formData)
        alert('Product created successfully')
      }

      navigate('/admin/products')
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save product')
      console.error(err)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return <div className="loading">Loading...</div>
  }

  return (
    <div className="product-form-container">
      <div className="form-header">
        <h1>{id ? 'Edit Product' : 'Add New Product'}</h1>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="form-wrapper">
        <form onSubmit={handleSubmit} encType="multipart/form-data">
          <div className="form-section">
            <h3>Product Information</h3>

            <div className="form-group">
              <label htmlFor="name">Product Name *</label>
              <input
                id="name"
                type="text"
                name="name"
                value={form.name}
                onChange={handleInputChange}
                placeholder="Enter product name"
                disabled={submitting}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="price">Price *</label>
                <input
                  id="price"
                  type="number"
                  name="price"
                  value={form.price}
                  onChange={handleInputChange}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  disabled={submitting}
                />
              </div>

              <div className="form-group">
                <label htmlFor="category">Category *</label>
                <select
                  id="category"
                  name="category"
                  value={form.category}
                  onChange={handleInputChange}
                  disabled={submitting}
                >
                  <option value="">Select a category</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                  <option value={form.category}>
                    {form.category && !categories.includes(form.category) && form.category}
                  </option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                value={form.description}
                onChange={handleInputChange}
                placeholder="Enter product description"
                rows="4"
                disabled={submitting}
              />
            </div>
          </div>

          <div className="form-section">
            <h3>Product Image</h3>

            <div className="image-upload">
              {imagePreview && (
                <div className="image-preview">
                  <img src={imagePreview} alt="Preview" />
                </div>
              )}

              <label htmlFor="image-input" className="upload-label">
                {imagePreview ? 'Change Image' : 'Upload Image'}
              </label>
              <input
                id="image-input"
                type="file"
                accept="image/*"
                onChange={(e) => handleImageSelect(e.target.files?.[0])}
                disabled={submitting}
                style={{ display: 'none' }}
              />
              <p className="upload-hint">
                {imagePreview ? 'Click above to change the image' : 'PNG, JPG, GIF up to 10MB'}
              </p>
            </div>
          </div>

          <div className="form-actions">
            <button 
              type="button" 
              className="cancel-btn"
              onClick={() => navigate('/admin/products')}
              disabled={submitting}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="submit-btn"
              disabled={submitting}
            >
              {submitting ? 'Saving...' : id ? 'Update Product' : 'Create Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
