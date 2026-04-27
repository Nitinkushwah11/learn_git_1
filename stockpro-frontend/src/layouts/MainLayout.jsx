import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import './Layout.css';

const MainLayout = () => {
  return (
    <div className="d-flex w-100">
      <Sidebar />
      <div className="main-content">
        <Navbar />
        <div className="container-fluid p-4">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default MainLayout;
