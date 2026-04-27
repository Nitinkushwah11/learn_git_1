import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock } from 'lucide-react';
import { authService } from '../../services/authService';
import './Auth.css';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await authService.login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container d-flex justify-content-center align-items-center vh-100">
      <div className="card auth-card w-100" style={{ maxWidth: '420px' }}>
        <div className="card-header auth-header-bg text-center py-4">
          <h2 className="mb-0 fw-bold">StockPro</h2>
          <p className="mb-0 mt-2 opacity-75">Welcome back! Please login.</p>
        </div>
        <div className="card-body p-4">
          <form onSubmit={handleLogin}>
            {error && <div className="alert alert-danger py-2 small">{error}</div>}
            <div className="mb-4">
              <label className="form-label text-muted small fw-bold">Email address</label>
              <div className="input-icon-wrapper">
                <Mail className="icon" />
                <input 
                  type="email" 
                  className="form-control form-control-lg" 
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required 
                />
              </div>
            </div>
            <div className="mb-4">
              <label className="form-label text-muted small fw-bold">Password</label>
              <div className="input-icon-wrapper">
                <Lock className="icon" />
                <input 
                  type="password" 
                  className="form-control form-control-lg" 
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required 
                />
              </div>
            </div>
            <button type="submit" className="btn btn-primary w-100 mb-3" disabled={loading}>
              {loading ? <span className="spinner-border spinner-border-sm me-2" role="status"></span> : null}
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
            <div className="text-center text-muted small">
              Don't have an account? <Link to="/register" className="text-decoration-none fw-bold">Sign up</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
