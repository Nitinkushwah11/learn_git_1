import React, { useState, useEffect } from 'react';
import { Download, TrendingUp, AlertTriangle, DollarSign, RefreshCcw, Loader, PieChart, Activity, Layers, ArrowUpCircle } from 'lucide-react';
import { reportService } from '../../services/reportService';
import { warehouseService } from '../../services/warehouseService';

const ReportsPage = () => {
  const [valuation, setValuation] = useState(null);
  const [turnover, setTurnover] = useState([]);
  const [utilization, setUtilization] = useState([]);
  const [velocity, setVelocity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchReportData = async () => {
      try {
        setLoading(true);
        const [valData, turnData, utilData, velData] = await Promise.all([
          reportService.getValuation(),
          reportService.getTurnover(),
          reportService.getUtilization(),
          reportService.getVelocity()
        ]);
        setValuation(valData);
        setTurnover(turnData);
        setUtilization(utilData);
        setVelocity(velData);
      } catch (err) {
        console.error('Error fetching report data:', err);
        setError('Failed to load analytical reports. Ensure report-service is active.');
      } finally {
        setLoading(false);
      }
    };

    fetchReportData();
  }, []);

  return (
    <div className="container-fluid py-2">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-0">Analytics & Intelligence</h2>
          <p className="text-muted mb-0">Financial insights and operational efficiency metrics.</p>
        </div>
        <div className="d-flex gap-2">
          <button className="btn btn-outline-primary d-flex align-items-center gap-2 shadow-sm">
            <Download size={18} /> Export CSV
          </button>
          <button className="btn btn-primary d-flex align-items-center gap-2 shadow-sm">
            <Activity size={18} /> Real-time View
          </button>
        </div>
      </div>

      {error && <div className="alert alert-danger border-0 shadow-sm mb-4">{error}</div>}

      {/* KPI Cards */}
      <div className="row g-4 mb-4">
        <div className="col-md-6 col-lg-3">
          <div className="card border-0 shadow-sm bg-primary text-white h-100">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-start mb-3">
                <p className="text-white-50 text-uppercase small fw-bold mb-0">Inventory Valuation</p>
                <DollarSign size={20} className="text-white-50" />
              </div>
              <h3 className="fw-bold mb-0">
                {loading ? '...' : `₹${valuation?.totalValuation?.toLocaleString(undefined, {minimumFractionDigits: 2}) || '0.00'}`}
              </h3>
              <p className="small text-white-50 mt-2 mb-0">Current total asset value</p>
            </div>
          </div>
        </div>

        <div className="col-md-6 col-lg-3">
          <div className="card border-0 shadow-sm h-100 border-start border-4 border-success">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-start mb-3">
                <p className="text-muted text-uppercase small fw-bold mb-0">Avg. Turnover Rate</p>
                <RefreshCcw size={20} className="text-success" />
              </div>
              <h3 className="fw-bold mb-0">
                {loading ? '...' : (turnover.reduce((acc, c) => acc + c.turnoverRate, 0) / (turnover.length || 1)).toFixed(2)}x
              </h3>
              <p className="small text-success mt-2 mb-0">Stock cycles per period</p>
            </div>
          </div>
        </div>

        <div className="col-md-6 col-lg-3">
          <div className="card border-0 shadow-sm h-100 border-start border-4 border-info">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-start mb-3">
                <p className="text-muted text-uppercase small fw-bold mb-0">Active Warehouses</p>
                <Layers size={20} className="text-info" />
              </div>
              <h3 className="fw-bold mb-0">{utilization.length}</h3>
              <p className="small text-muted mt-2 mb-0">Storage locations tracked</p>
            </div>
          </div>
        </div>

        <div className="col-md-6 col-lg-3">
          <div className="card border-0 shadow-sm h-100 border-start border-4 border-warning">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-start mb-3">
                <p className="text-muted text-uppercase small fw-bold mb-0">Avg. Utilization</p>
                <PieChart size={20} className="text-warning" />
              </div>
              <h3 className="fw-bold mb-0">
                {loading ? '...' : Math.round(utilization.reduce((acc, c) => acc + c.utilizationPercentage, 0) / (utilization.length || 1))}%
              </h3>
              <p className="small text-muted mt-2 mb-0">Global storage capacity used</p>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-4">
        {/* Turnover Table */}
        <div className="col-lg-7">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-white border-bottom pt-4 pb-3">
              <h5 className="fw-bold mb-0 d-flex align-items-center gap-2">
                <TrendingUp size={20} className="text-primary" /> Product Performance (Velocity)
              </h5>
            </div>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light">
                    <tr>
                      <th className="px-4">Product ID</th>
                      <th>Velocity (Items/Day)</th>
                      <th>Turnover</th>
                      <th>Health</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr><td colSpan="4" className="text-center py-5"><Loader className="animate-spin mx-auto" /></td></tr>
                    ) : velocity.map((item, idx) => (
                      <tr key={idx}>
                        <td className="px-4 fw-bold text-primary font-monospace">PROD-{item.productId}</td>
                        <td>
                          <div className="d-flex align-items-center gap-2">
                            <ArrowUpCircle size={14} className="text-success" />
                            {item.averageDailySales?.toFixed(2) || '0.00'}
                          </div>
                        </td>
                        <td>{turnover.find(t => t.productId === item.productId)?.turnoverRate?.toFixed(2) || '0.00'}x</td>
                        <td>
                          <span className={`badge rounded-pill ${item.averageDailySales > 5 ? 'bg-success-subtle text-success' : 'bg-warning-subtle text-warning'}`}>
                            {item.averageDailySales > 5 ? 'Fast Mover' : 'Stable'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
        
        {/* Warehouse Utilization */}
        <div className="col-lg-5">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-white border-bottom pt-4 pb-3">
              <h5 className="fw-bold mb-0 d-flex align-items-center gap-2">
                <PieChart size={20} className="text-info" /> Warehouse Utilization
              </h5>
            </div>
            <div className="card-body">
              {loading ? (
                <div className="text-center py-5"><Loader className="animate-spin mx-auto" /></div>
              ) : utilization.map((wh, idx) => (
                <div key={idx} className="mb-4 last-child-mb-0">
                  <div className="d-flex justify-content-between mb-1 small">
                    <span className="fw-bold">{wh.warehouseName}</span>
                    <span className="text-muted">{Math.round(wh.utilizationPercentage)}% Used</span>
                  </div>
                  <div className="progress" style={{height: '10px'}}>
                    <div 
                      className={`progress-bar ${wh.utilizationPercentage > 85 ? 'bg-danger' : wh.utilizationPercentage > 60 ? 'bg-warning' : 'bg-success'}`}
                      style={{width: `${wh.utilizationPercentage}%`}}
                    ></div>
                  </div>
                  <div className="small text-muted mt-1">
                    {wh.totalQuantity.toLocaleString()} / {wh.totalCapacity.toLocaleString()} total units
                  </div>
                </div>
              ))}
              
              <div className="mt-4 p-3 bg-light rounded-3 border">
                <h6 className="fw-bold small mb-2 d-flex align-items-center gap-2">
                  <AlertTriangle size={14} className="text-warning" /> Efficiency Note
                </h6>
                <p className="small text-muted mb-0">
                  Warehouses above 85% capacity may experience slower pick/pack times. Consider load balancing stock to underutilized locations.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;
