import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Phone, Shield, Building } from 'lucide-react';
import { authService } from '../../services/authService';
import './Auth.css';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    role: '',
    department: 'General'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value
    });
  };

  const getRoleDescription = (role) => {
    switch (role) {
      case 'STAFF': return 'Access: Dashboard, Products, Warehouses, Movements, Purchases';
      case 'MANAGER': return 'Access: Staff permissions + Reports';
      case 'OFFICER': return 'Access: Staff permissions + Suppliers';
      case 'ADMIN': return 'Full system access including User Management';
      default: return 'Select a role to see permissions';
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await authService.register(formData);
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container d-flex justify-content-center align-items-center vh-100">
      <div className="card auth-card w-100" style={{ maxWidth: '480px' }}>
        <div className="card-header auth-header-bg text-center py-4">
          <h2 className="mb-0 fw-bold">Join StockPro</h2>
          <p className="mb-0 mt-2 opacity-75">Create an account to manage your inventory.</p>
        </div>
        <div className="card-body p-4">
          <form onSubmit={handleRegister}>
            {error && <div className="alert alert-danger py-2 small">{error}</div>}
            <div className="mb-3">
              <label className="form-label text-muted small fw-bold">Full Name</label>
              <div className="input-icon-wrapper">
                <User className="icon" />
                <input 
                  type="text" 
                  className="form-control" 
                  id="fullName"
                  placeholder="John Doe"
                  value={formData.fullName}
                  onChange={handleChange}
                  required 
                />
              </div>
            </div>
            <div className="mb-3">
              <label className="form-label text-muted small fw-bold">Email address</label>
              <div className="input-icon-wrapper">
                <Mail className="icon" />
                <input 
                  type="email" 
                  className="form-control" 
                  id="email"
                  placeholder="john@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  required 
                />
              </div>
            </div>
            <div className="mb-3">
              <label className="form-label text-muted small fw-bold">Phone Number</label>
              <div className="input-icon-wrapper">
                <Phone className="icon" />
                <input 
                  type="tel" 
                  className="form-control" 
                  id="phone"
                  placeholder="e.g. 9876543210"
                  value={formData.phone}
                  onChange={handleChange}
                  pattern="^[6-9]\d{9}$"
                  maxLength="10"
                  title="Please enter a valid 10-digit Indian mobile number starting with 6-9"
                  required 
                />
              </div>
            </div>
            <div className="mb-3">
              <label className="form-label text-muted small fw-bold">Role</label>
              <div className="input-icon-wrapper">
                <Shield className="icon" />
                <select
                  className="form-control"
                  id="role"
                  value={formData.role}
                  onChange={handleChange}
                  required
                  style={{ paddingLeft: '2.5rem' }}
                >
                  <option value="">Select role...</option>
                  <option value="STAFF">Warehouse Staff</option>
                  <option value="MANAGER">Inventory Manager</option>
                  <option value="OFFICER">Purchase Officer</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>
              <div className="form-text mt-1 text-primary" style={{ fontSize: '0.75rem' }}>
                <Shield size={12} className="me-1 d-inline" />
                {getRoleDescription(formData.role)}
              </div>
            </div>
            <div className="mb-3">
              <label className="form-label text-muted small fw-bold">Department</label>
              <div className="input-icon-wrapper">
                <Building className="icon" />
                <input
                  type="text"
                  className="form-control"
                  id="department"
                  placeholder="e.g. General"
                  value={formData.department}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div className="mb-4">
              <label className="form-label text-muted small fw-bold">Password</label>
              <div className="input-icon-wrapper">
                <Lock className="icon" />
                <input 
                  type="password" 
                  className="form-control" 
                  id="password"
                  placeholder="Create a password"
                  value={formData.password}
                  onChange={handleChange}
                  required 
                />
              </div>
            </div>
            <button type="submit" className="btn btn-primary w-100 mb-3" disabled={loading}>
              {loading ? <span className="spinner-border spinner-border-sm me-2" role="status"></span> : null}
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
            <div className="text-center text-muted small">
              Already have an account? <Link to="/login" className="text-decoration-none fw-bold">Sign in</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
