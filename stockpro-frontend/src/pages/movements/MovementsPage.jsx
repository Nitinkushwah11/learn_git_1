import React, { useState, useEffect } from 'react';
import { ArrowDownRight, ArrowUpRight, RefreshCw, Loader, Search, Filter, History, Calendar, Package } from 'lucide-react';
import { movementService } from '../../services/movementService';
import { productService } from '../../services/productService';
import { warehouseService } from '../../services/warehouseService';

const MovementsPage = () => {
  const [movements, setMovements] = useState([]);
  const [products, setProducts] = useState({});
  const [warehouses, setWarehouses] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filters
  const [filterType, setFilterType] = useState('ALL');
  const [searchProduct, setSearchProduct] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [movData, prodData, whData] = await Promise.all([
          movementService.getAllMovements(),
          productService.getAllProducts(),
          warehouseService.getAllWarehouses()
        ]);
        
        const prodMap = {};
        prodData.forEach(p => prodMap[p.productId] = p.name);
        
        const whMap = {};
        whData.forEach(w => whMap[w.warehouseId] = w.name);
        
        setProducts(prodMap);
        setWarehouses(whMap);
        setMovements(movData.reverse()); 
        setError(null);
      } catch (err) {
        console.error('Error:', err);
        setError('Failed to load movement logs.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getTypeStyle = (type) => {
    switch(type) {
      case 'STOCK_IN': return { icon: <ArrowDownRight size={16} />, class: 'bg-success-subtle text-success', label: 'Stock In' };
      case 'STOCK_OUT': return { icon: <ArrowUpRight size={16} />, class: 'bg-danger-subtle text-danger', label: 'Stock Out' };
      case 'TRANSFER': return { icon: <RefreshCw size={16} />, class: 'bg-primary-subtle text-primary', label: 'Transfer' };
      default: return { icon: null, class: 'bg-secondary-subtle', label: type };
    }
  };

  const filteredMovements = movements.filter(mov => {
    const matchesType = filterType === 'ALL' || mov.movementType === filterType;
    const prodName = products[mov.productId]?.toLowerCase() || '';
    const matchesSearch = prodName.includes(searchProduct.toLowerCase()) || mov.productId.toString().includes(searchProduct);
    return matchesType && matchesSearch;
  });

  return (
    <div className="container-fluid py-2">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-0">Stock Movements</h2>
          <p className="text-muted mb-0">Immutable audit trail of all inventory transactions.</p>
        </div>
      </div>

      <div className="row g-3 mb-4">
        <div className="col-md-4">
          <div className="input-group bg-white shadow-sm rounded">
            <span className="input-group-text bg-transparent border-0"><Search size={18} className="text-muted" /></span>
            <input type="text" className="form-control border-0" placeholder="Filter by product name or ID..." 
              value={searchProduct} onChange={e => setSearchProduct(e.target.value)} />
          </div>
        </div>
        <div className="col-md-3">
          <div className="input-group bg-white shadow-sm rounded">
            <span className="input-group-text bg-transparent border-0"><Filter size={18} className="text-muted" /></span>
            <select className="form-select border-0" value={filterType} onChange={e => setFilterType(e.target.value)}>
              <option value="ALL">All Movement Types</option>
              <option value="STOCK_IN">Stock In (+)</option>
              <option value="STOCK_OUT">Stock Out (-)</option>
              <option value="TRANSFER">Transfers (↔)</option>
            </select>
          </div>
        </div>
      </div>

      {error && <div className="alert alert-danger border-0 shadow-sm mb-4">{error}</div>}

      <div className="card border-0 shadow-sm overflow-hidden">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th className="ps-4">Timestamp</th>
                  <th>Product</th>
                  <th>Warehouse</th>
                  <th>Type</th>
                  <th>Quantity</th>
                  <th>Reference</th>
                  <th className="pe-4">Notes</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="7" className="text-center py-5"><Loader className="animate-spin mx-auto text-primary" /></td></tr>
                ) : filteredMovements.length > 0 ? (
                  filteredMovements.map(mov => {
                    const style = getTypeStyle(mov.movementType);
                    return (
                      <tr key={mov.movementId}>
                        <td className="ps-4">
                          <div className="d-flex align-items-center gap-2">
                            <Calendar size={14} className="text-muted" />
                            <span className="small fw-medium">{new Date(mov.movementDate).toLocaleString()}</span>
                          </div>
                        </td>
                        <td>
                          <div className="fw-bold">{products[mov.productId] || `Product #${mov.productId}`}</div>
                          <div className="text-muted small">ID: {mov.productId}</div>
                        </td>
                        <td>
                          <div className="d-flex align-items-center gap-2">
                            <Package size={14} className="text-muted" />
                            <span className="small">{warehouses[mov.warehouseId] || `Warehouse #${mov.warehouseId}`}</span>
                          </div>
                        </td>
                        <td>
                          <span className={`badge rounded-pill d-inline-flex align-items-center gap-1 ${style.class}`}>
                            {style.icon} {style.label}
                          </span>
                        </td>
                        <td className={`fw-bold font-monospace ${mov.movementType === 'STOCK_OUT' ? 'text-danger' : 'text-success'}`}>
                          {mov.movementType === 'STOCK_OUT' ? '-' : '+'}{mov.quantity}
                        </td>
                        <td>
                          <div className="badge bg-light text-dark border fw-normal">
                            {mov.referenceType}: {mov.referenceId}
                          </div>
                        </td>
                        <td className="pe-4 small text-muted font-italic">{mov.notes || '—'}</td>
                      </tr>
                    );
                  })
                ) : (
                  <tr><td colSpan="7" className="text-center py-5 text-muted">No movements match your criteria.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovementsPage;
