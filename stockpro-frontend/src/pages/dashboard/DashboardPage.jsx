import React, { useState, useEffect, Suspense } from 'react';
import { Link } from 'react-router-dom';

const LowStockChart = React.lazy(() => import('../../components/LowStockChart'));
import { warehouseService } from '../../services/warehouseService';
import { purchaseService } from '../../services/purchaseService';
import { productService } from '../../services/productService';
import { reportService } from '../../services/reportService';
import { movementService } from '../../services/movementService';
import { supplierService } from '../../services/supplierService';

const DashboardPage = () => {
  const [lowStockItems, setLowStockItems] = useState([]);
  const [pendingPOs, setPendingPOs] = useState([]);
  const [valuation, setValuation] = useState(null);
  const [utilization, setUtilization] = useState([]);
  const [movements, setMovements] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        // Fetch dashboard data in parallel
        const [lowStock, pending, valData, utilData, movData, supData] = await Promise.all([
          warehouseService.getLowStockItems(20),
          purchaseService.getPOsByStatus('PENDING_APPROVAL'),
          reportService.getValuation(),
          reportService.getUtilization(),
          movementService.getAllMovements(0, 100),
          supplierService.getAllSuppliers()
        ]);

        setLowStockItems(lowStock);
        setPendingPOs(pending);
        setValuation(valData);
        setUtilization(utilData);
        setMovements(movData);
        setSuppliers(supData);
        setError(null);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load real-time data. Showing demo data instead.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <div className="pb-5 container-fluid px-0">
      {/* Optional Error Alert */}
      {error && (
        <div className="alert alert-warning alert-dismissible fade show" role="alert" aria-live="assertive">
          {error}
          <button type="button" className="btn-close" onClick={() => setError(null)} aria-label="Close alert"></button>
        </div>
      )}

      {/* KPI Section */}
      <div className="row g-4 mb-4">
        {/* Total Value */}
        <div className="col-12 col-md-6 col-lg-3">
          <div className="card h-100 border-0 shadow-sm rounded-1">
            <div className="card-body d-flex flex-column justify-content-between">
              <div>
                <p className="text-muted text-uppercase fw-bold mb-1" style={{ fontSize: '0.7rem', letterSpacing: '0.5px' }}>
                  Total Inventory Value
                </p>
                <h3 className="mb-0 text-dark fw-bold">
                  {loading ? '...' : `₹${valuation?.totalValuation?.toLocaleString(undefined, { maximumFractionDigits: 0 }) || '0'}`}
                </h3>
              </div>
              <div className="d-flex align-items-center mt-3 text-success">
                <span className="material-symbols-outlined fs-6 fw-bold">trending_up</span>
                <span className="ms-1" style={{ fontSize: '0.8rem' }}>+2.4% vs last month</span>
              </div>
            </div>
          </div>
        </div>

        {/* Active Suppliers */}
        <div className="col-12 col-md-6 col-lg-3">
          <div className="card h-100 border-0 shadow-sm rounded-1">
            <div className="card-body d-flex flex-column justify-content-between">
              <div>
                <p className="text-muted text-uppercase fw-bold mb-1" style={{ fontSize: '0.7rem', letterSpacing: '0.5px' }}>
                  Active Suppliers
                </p>
                <h3 className="mb-0 text-dark fw-bold">
                  {loading ? '...' : suppliers.filter(s => s.active || s.isActive).length}
                </h3>
              </div>
              <div className="d-flex align-items-center mt-3 text-primary">
                <span className="material-symbols-outlined fs-6">badge</span>
                <span className="ms-1" style={{ fontSize: '0.8rem' }}>Partnering Vendors</span>
              </div>
            </div>
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="col-12 col-md-6 col-lg-3">
          <div className="card h-100 border-danger border border-opacity-50 shadow-sm rounded-1" style={{ backgroundColor: '#fff3f3' }}>
            <div className="card-body d-flex flex-column justify-content-between">
              <div>
                <p className="text-danger text-uppercase fw-bold mb-1" style={{ fontSize: '0.7rem', letterSpacing: '0.5px' }}>
                  Low Stock Alerts
                </p>
                <h3 className="mb-0 text-danger fw-bold">
                  {loading ? '...' : `${lowStockItems.length} items`}
                </h3>
              </div>
              <div className="d-flex align-items-center mt-3 text-danger fw-bold">
                <span className="material-symbols-outlined fs-6" style={{ fontVariationSettings: "'FILL' 1" }}>warning</span>
                <span className="ms-1" style={{ fontSize: '0.75rem' }}>
                  {lowStockItems.length > 0 ? 'ACTION REQUIRED' : 'ALL CLEAR'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Pending Approvals */}
        <div className="col-12 col-md-6 col-lg-3">
          <div className="card h-100 border-0 shadow-sm rounded-1">
            <div className="card-body d-flex flex-column justify-content-between">
              <div>
                <p className="text-muted text-uppercase fw-bold mb-1" style={{ fontSize: '0.7rem', letterSpacing: '0.5px' }}>
                  Pending Approvals
                </p>
                <h3 className="mb-0 text-dark fw-bold">
                  {loading ? '...' : `${pendingPOs.length} POs`}
                </h3>
              </div>
              <div className="d-flex align-items-center mt-3 text-primary">
                <span className="material-symbols-outlined fs-6">schedule</span>
                <span className="ms-1" style={{ fontSize: '0.8rem' }}>Needs Attention</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Middle Section */}
      <div className="row g-4 mb-4">
        {/* Critical Alerts Table */}
        <div className="col-12 col-lg-8">
          <div className="card border-0 shadow-sm rounded-1 h-100">
            <div className="card-header bg-light border-bottom d-flex justify-content-between align-items-center py-3">
              <h5 className="mb-0 text-primary fw-semibold fs-6">Critical Inventory Alerts</h5>
              <button className="btn btn-link btn-sm text-decoration-none fw-bold text-uppercase p-0" style={{ fontSize: '0.75rem' }}>
                VIEW ALL
              </button>
            </div>
            <div className="table-responsive">
              <table className="table table-hover mb-0 align-middle">
                <thead className="table-light text-secondary text-uppercase" style={{ fontSize: '0.75rem' }}>
                  <tr>
                    <th className="py-3 px-3 fw-semibold border-bottom-0">Status</th>
                    <th className="py-3 px-3 fw-semibold border-bottom-0">SKU</th>
                    <th className="py-3 px-3 fw-semibold border-bottom-0">Product Name</th>
                    <th className="py-3 px-3 fw-semibold border-bottom-0 text-end">Stock</th>
                    <th className="py-3 px-3 fw-semibold border-bottom-0 text-end">Threshold</th>
                  </tr>
                </thead>
                <tbody style={{ fontSize: '0.875rem' }}>
                  {lowStockItems.length > 0 ? (
                    lowStockItems.slice(0, 5).map((item, index) => (
                      <tr key={index}>
                        <td className="px-3">
                          <span
                            className={`badge rounded-pill ${item.quantity < 5 ? 'bg-danger' : 'bg-warning text-dark'}`}
                            style={{ fontSize: '0.65rem' }}
                          >
                            {item.quantity < 5 ? 'CRITICAL' : 'WARNING'}
                          </span>
                        </td>
                        <td className="px-3 font-monospace text-muted">PROD-{item.productId}</td>
                        <td className="px-3">{item.productName || `Product ID: ${item.productId}`}</td>
                        <td className={`px-3 text-end fw-bold ${item.quantity < 5 ? 'text-danger' : 'text-warning'}`}>
                          {item.quantity}
                        </td>
                        <td className="px-3 text-end text-muted">{item.threshold || 20}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="text-center py-4 text-muted small">
                        {loading ? 'Fetching live alerts...' : 'No low stock alerts found.'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Quick Actions & Warehouse */}
        <div className="col-12 col-lg-4 d-flex flex-column gap-4">

          {/* Quick Actions */}
          <div className="card border-0 shadow-sm rounded-1">
            <div className="card-body p-4">
              <h5 className="mb-4 text-primary fw-semibold fs-6">Quick Actions</h5>
              <div className="d-grid gap-3">
                <Link to="/products" className="btn btn-primary d-flex justify-content-between align-items-center py-2 px-3 shadow-none">
                  <div className="d-flex align-items-center gap-2">
                    <span className="material-symbols-outlined fs-5">add_box</span>
                    <span className="fw-semibold text-white" style={{ fontSize: '0.875rem' }}>Manage Products</span>
                  </div>
                  <span className="material-symbols-outlined fs-6 text-white">chevron_right</span>
                </Link>

                <Link to="/purchases" className="btn btn-light border d-flex justify-content-between align-items-center py-2 px-3 shadow-none">
                  <div className="d-flex align-items-center gap-2">
                    <span className="material-symbols-outlined fs-5 text-secondary">receipt_long</span>
                    <span className="fw-semibold text-dark" style={{ fontSize: '0.875rem' }}>Create Purchase Order</span>
                  </div>
                  <span className="material-symbols-outlined fs-6 text-secondary">chevron_right</span>
                </Link>

                <Link to="/warehouses" className="btn btn-light border d-flex justify-content-between align-items-center py-2 px-3 shadow-none">
                  <div className="d-flex align-items-center gap-2">
                    <span className="material-symbols-outlined fs-5 text-secondary">move_up</span>
                    <span className="fw-semibold text-dark" style={{ fontSize: '0.875rem' }}>Stock Transfers</span>
                  </div>
                  <span className="material-symbols-outlined fs-6 text-secondary">chevron_right</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Warehouse Status Card */}
          <div className="card rounded-1 border-0 flex-grow-1" style={{ backgroundColor: '#002855', color: 'white' }}>
            <div className="card-body p-4">
              <div className="d-flex justify-content-between align-items-start mb-3">
                <div>
                  <h6 className="fw-semibold mb-1">
                    {utilization[0]?.warehouseName || 'Main Hub Logistics'}
                  </h6>
                  <p className="text-info text-uppercase fw-bold mb-0" style={{ fontSize: '0.65rem', letterSpacing: '1px' }}>
                    Operational Status
                  </p>
                </div>
                <span className="material-symbols-outlined text-success">check_circle</span>
              </div>
              <div className="mt-4">
                <div className="d-flex justify-content-between mb-1" style={{ fontSize: '0.75rem' }}>
                  <span className="text-white-50">Capacity Utilization</span>
                  <span className="fw-bold">
                    {loading ? '...' : Math.round(utilization[0]?.utilizationPercentage || 0)}%
                  </span>
                </div>
                <div className="progress" style={{ height: '6px', backgroundColor: '#00152e' }}>
                  <div
                    className="progress-bar bg-success"
                    role="progressbar"
                    style={{ width: `${utilization[0]?.utilizationPercentage || 0}%` }}
                    aria-valuenow={utilization[0]?.utilizationPercentage || 0}
                    aria-valuemin="0"
                    aria-valuemax="100"
                  ></div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Stock Movement Chart */}
      <Suspense fallback={<div className="card border-0 shadow-sm rounded-1 mb-4 p-5 text-center text-muted"><span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Loading chart...</div>}>
        <LowStockChart movements={movements} />
      </Suspense>

      {/* Contextual FAB */}
      <button
        className="btn btn-primary rounded-circle shadow position-fixed d-flex align-items-center justify-content-center"
        style={{ width: '56px', height: '56px', bottom: '30px', right: '30px', zIndex: 1050 }}
      >
        <span className="material-symbols-outlined fs-4">add</span>
      </button>
    </div>
  );
};

export default DashboardPage;