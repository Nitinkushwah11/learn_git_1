import React, { useState, useRef, useEffect } from 'react';
import { Bell, User, LogOut, Settings, UserCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';

const Navbar = () => {
  const navigate = useNavigate();
  const user = authService.getCurrentUser();
  const displayName = user ? user.fullName : "User";

  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const userMenuRef = useRef(null);
  const notifRef = useRef(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setShowUserMenu(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  const notifications = [
    { id: 1, text: 'Low stock alert: Widget A below threshold', time: '5 min ago', type: 'warning' },
    { id: 2, text: 'Purchase Order #1042 approved', time: '1 hour ago', type: 'success' },
    { id: 3, text: 'New user registered: warehouse staff', time: '3 hours ago', type: 'info' },
  ];

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-white px-4 py-2 border-bottom shadow-sm">
      <div className="container-fluid">
        <span className="navbar-brand mb-0 h1 fw-bold text-primary d-lg-none">StockPro</span>
        
        <div className="d-flex ms-auto align-items-center gap-3">
          
          {/* Notification Bell */}
          <div className="position-relative" ref={notifRef}>
            <button 
              className="btn btn-light position-relative rounded-circle p-2"
              onClick={() => { setShowNotifications(!showNotifications); setShowUserMenu(false); }}
            >
              <Bell size={20} className="text-secondary" />
              <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style={{ fontSize: '0.65em' }}>
                {notifications.length}
              </span>
            </button>

            {showNotifications && (
              <div className="position-absolute end-0 mt-2 shadow-lg border-0 rounded-3 bg-white" style={{ width: '340px', zIndex: 1050 }}>
                <div className="px-3 py-2 border-bottom d-flex justify-content-between align-items-center">
                  <h6 className="mb-0 fw-bold">Notifications</h6>
                  <span className="badge bg-primary rounded-pill">{notifications.length} new</span>
                </div>
                <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                  {notifications.map(n => (
                    <div key={n.id} className="px-3 py-2 border-bottom d-flex align-items-start gap-2" style={{ cursor: 'pointer' }}>
                      <span className={`mt-1 rounded-circle d-inline-block`} style={{ 
                        width: '8px', height: '8px', minWidth: '8px',
                        backgroundColor: n.type === 'warning' ? '#f59e0b' : n.type === 'success' ? '#10b981' : '#3b82f6'
                      }}></span>
                      <div>
                        <p className="mb-0 small">{n.text}</p>
                        <small className="text-muted">{n.time}</small>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="px-3 py-2 text-center">
                  <button 
                    className="btn btn-sm btn-link text-decoration-none"
                    onClick={() => { setShowNotifications(false); navigate('/admin/settings?tab=alerts'); }}
                  >
                    Manage Notifications
                  </button>
                </div>
              </div>
            )}
          </div>
          
          {/* User Dropdown */}
          <div className="position-relative" ref={userMenuRef}>
            <button 
              className="btn btn-light rounded-pill px-3 py-2 d-flex align-items-center gap-2"
              onClick={() => { setShowUserMenu(!showUserMenu); setShowNotifications(false); }}
            >
              <User size={18} />
              <span className="fw-medium small d-none d-md-block">{displayName}</span>
            </button>

            {showUserMenu && (
              <div className="position-absolute end-0 mt-2 shadow-lg border-0 rounded-3 bg-white py-1" style={{ width: '200px', zIndex: 1050 }}>
                <button 
                  className="dropdown-item d-flex align-items-center gap-2 px-3 py-2"
                  onClick={() => { setShowUserMenu(false); navigate('/admin/settings?tab=profile'); }}
                >
                  <UserCircle size={16} /> Profile
                </button>
                <button 
                  className="dropdown-item d-flex align-items-center gap-2 px-3 py-2"
                  onClick={() => { setShowUserMenu(false); navigate('/admin/settings?tab=alerts'); }}
                >
                  <Settings size={16} /> Settings
                </button>
                <hr className="dropdown-divider my-1" />
                <button 
                  className="dropdown-item text-danger d-flex align-items-center gap-2 px-3 py-2"
                  onClick={handleLogout}
                >
                  <LogOut size={16} /> Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
