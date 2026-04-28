import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';

// Lazy load pages
const LoginPage = lazy(() => import('./pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('./pages/auth/RegisterPage'));
const DashboardPage = lazy(() => import('./pages/dashboard/DashboardPage'));
const ProductsPage = lazy(() => import('./pages/products/ProductsPage'));
const WarehousesPage = lazy(() => import('./pages/warehouses/WarehousesPage'));
const PurchasesPage = lazy(() => import('./pages/purchases/PurchasesPage'));
const MovementsPage = lazy(() => import('./pages/movements/MovementsPage'));
const SuppliersPage = lazy(() => import('./pages/suppliers/SuppliersPage'));
const ReportsPage = lazy(() => import('./pages/reports/ReportsPage'));
const AdminSettingsPage = lazy(() => import('./pages/admin/AdminSettingsPage'));
const PaymentsPage = lazy(() => import('./pages/payments/PaymentsPage'));

const FallbackLoader = () => (
  <div className="d-flex justify-content-center align-items-center vh-100">
    <div className="spinner-border text-primary" role="status">
      <span className="visually-hidden">Loading...</span>
    </div>
  </div>
);

function App() {
  return (
    <div class="app">
      <Suspense fallback={<FallbackLoader />}>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" />} />

          {/* Auth Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected Dashboard Routes wrapped in MainLayout */}
          <Route element={<MainLayout />}>
            {/* Base Protected Route (All Authenticated Users) */}
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/movements" element={<MovementsPage />} />
              <Route path="/admin/settings" element={<AdminSettingsPage />} />
              <Route path="/products" element={<ProductsPage />} />
              <Route path="/warehouses" element={<WarehousesPage />} />
              <Route path="/purchases" element={<PurchasesPage />} />
              <Route path="/payments" element={<PaymentsPage />} />
            </Route>

            {/* Restricted to Admin and Officer */}
            <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'OFFICER']} />}>
              <Route path="/suppliers" element={<SuppliersPage />} />
            </Route>

            {/* Restricted to Admin and Manager */}
            <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'MANAGER']} />}>
              <Route path="/reports" element={<ReportsPage />} />
            </Route>
          </Route>
        </Routes>
      </Suspense>
    </div>
  )
}

export default App
