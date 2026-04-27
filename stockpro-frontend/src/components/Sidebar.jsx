import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Box, Warehouse, ShoppingCart, Users, ArrowRightLeft, FileBarChart } from 'lucide-react';
import { authService } from '../services/authService';
import '../layouts/Layout.css';

const Sidebar = () => {
  const user = authService.getCurrentUser();
  const userRole = user ? user.role : null;

  const canAccessSuppliers = ['ADMIN', 'OFFICER'].includes(userRole);
  const canAccessReports = ['ADMIN', 'MANAGER'].includes(userRole);

  return (
    <div className="sidebar py-4 d-flex flex-column">
      <div className="text-center mb-4">
        <h3 className="fw-bold m-0 text-white">StockPro</h3>
        <span className="small text-muted" style={{ opacity: 0.6 }}>Inventory System</span>
      </div>
      
      <ul className="nav flex-column mb-auto">
        <li className="nav-item">
          <NavLink to="/dashboard" className="nav-link" end>
            <LayoutDashboard size={20} /> Dashboard
          </NavLink>
        </li>
        <li className="nav-item">
          <NavLink to="/products" className="nav-link">
            <Box size={20} /> Products
          </NavLink>
        </li>
        <li className="nav-item">
          <NavLink to="/warehouses" className="nav-link">
            <Warehouse size={20} /> Warehouses
          </NavLink>
        </li>
        <li className="nav-item">
          <NavLink to="/purchases" className="nav-link">
            <ShoppingCart size={20} /> Purchases
          </NavLink>
        </li>
        <li className="nav-item">
          <NavLink to="/movements" className="nav-link">
            <ArrowRightLeft size={20} /> Movements
          </NavLink>
        </li>
        {canAccessSuppliers && (
          <li className="nav-item">
            <NavLink to="/suppliers" className="nav-link">
              <Users size={20} /> Suppliers
            </NavLink>
          </li>
        )}
        {canAccessReports && (
          <li className="nav-item">
            <NavLink to="/reports" className="nav-link">
              <FileBarChart size={20} /> Reports
            </NavLink>
          </li>
        )}
      </ul>
    </div>
  );
};

export default Sidebar;
