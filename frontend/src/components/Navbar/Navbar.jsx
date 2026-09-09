import { Link, useNavigate } from 'react-router-dom'
import './Navbar.css'

export default function Navbar({ user, onLogout }) {
  const navigate = useNavigate()

  const handleLogout = () => {
    onLogout()
    navigate('/login')
  }

  const handleBrandClick = () => {
    navigate('/')
  }

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-brand" onClick={handleBrandClick}>
          <span>ShopLens</span>
        </div>

        <ul className="navbar-menu">
          <li>
            <Link to="/products">Browse Products</Link>
          </li>
          <li>
            <Link to="/find-similar">Find Similar</Link>
          </li>

          {user?.role === 'admin' && (
            <li>
              <Link to="/admin">Admin Dashboard</Link>
            </li>
          )}
        </ul>

        <div className="navbar-auth">
          {user ? (
            <div className="user-menu">
              <span className="user-name">{user.name}</span>
              <button className="logout-btn" onClick={handleLogout}>
                Logout
              </button>
            </div>
          ) : (
            <div className="auth-links">
              <Link to="/login" className="login-link">
                Login
              </Link>
              <Link to="/signup" className="signup-link">
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}
