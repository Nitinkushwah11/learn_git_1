import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Eye, X, Loader, Search, Package, ArrowRightLeft } from 'lucide-react';
import { warehouseService } from '../../services/warehouseService';

const WarehousesPage = () => {
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [selectedWarehouse, setSelectedWarehouse] = useState(null);
  const [saving, setSaving] = useState(false);

  // Stock modal
  const [showStockModal, setShowStockModal] = useState(false);
  const [stockItems, setStockItems] = useState([]);
  const [stockLoading, setStockLoading] = useState(false);
  const [stockWarehouse, setStockWarehouse] = useState(null);

  // Transfer modal
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [transfering, setTransfering] = useState(false);
  const [transferData, setTransferData] = useState({ fromWarehouseId: '', toWarehouseId: '', productId: '', quantity: 1 });
  const [allProducts, setAllProducts] = useState([]); // For transfer dropdown

  // Delete
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Form
  const emptyForm = { name: '', location: '', address: '', managerId: '', capacity: '', phone: '' };
  const [formData, setFormData] = useState(emptyForm);
  const [formErrors, setFormErrors] = useState({});

  // Fetch warehouses
  const fetchWarehouses = async () => {
    try {
      setLoading(true);
      const data = await warehouseService.getAllWarehouses();
      setWarehouses(data);
      setError(null);
    } catch (err) {
      console.error('Error:', err);
      setError('Failed to load warehouses. Make sure warehouse-service and api-gateway are running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchWarehouses(); }, []);
  useEffect(() => {
    if (successMsg) { const t = setTimeout(() => setSuccessMsg(null), 4000); return () => clearTimeout(t); }
  }, [successMsg]);

  // Validation
  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = 'Name is required';
    if (!formData.location.trim()) errors.location = 'Location is required';
    if (!formData.address.trim()) errors.address = 'Address is required';
    if (!formData.capacity || formData.capacity < 1) errors.capacity = 'Capacity must be > 0';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (formErrors[name]) setFormErrors(prev => ({ ...prev, [name]: null }));
  };

  // Modal handlers
  const openAddModal = () => { setFormData(emptyForm); setFormErrors({}); setModalMode('add'); setShowModal(true); };
  const openEditModal = (wh) => {
    setFormData({ name: wh.name||'', location: wh.location||'', address: wh.address||'', managerId: wh.managerId||'', capacity: wh.capacity||'', phone: wh.phone||'' });
    setFormErrors({}); setSelectedWarehouse(wh); setModalMode('edit'); setShowModal(true);
  };
  const closeModal = () => { setShowModal(false); setSelectedWarehouse(null); setFormData(emptyForm); };

  // View stock
  const openStockView = async (wh) => {
    setStockWarehouse(wh);
    setShowStockModal(true);
    setStockLoading(true);
    try {
      const data = await warehouseService.getStockByWarehouse(wh.warehouseId);
      setStockItems(data);
    } catch (err) {
      console.error('Stock fetch error:', err);
      setStockItems([]);
    } finally {
      setStockLoading(false);
    }
  };

  // Save
  const handleSave = async () => {
    if (!validateForm()) return;
    setSaving(true);
    try {
      if (modalMode === 'add') {
        await warehouseService.createWarehouse(formData);
        setSuccessMsg('Warehouse registered successfully!');
      } else {
        await warehouseService.updateWarehouse(selectedWarehouse.warehouseId, formData);
        setSuccessMsg('Warehouse updated successfully!');
      }
      closeModal();
      await fetchWarehouses();
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.error || 'Failed to save.';
      setFormErrors({ _server: msg });
    } finally { setSaving(false); }
  };

  // Transfer
  const openTransferModal = (fromWhId = '') => {
    setTransferData({ fromWarehouseId: fromWhId, toWarehouseId: '', productId: '', quantity: 1 });
    setShowTransferModal(true);
    // Fetch products to populate dropdown if needed, but for now we'll assume user knows ID or we can fetch a list
    // warehouseService.getLowStockItems().then(items => setAllProducts(items)); 
  };

  const handleTransfer = async () => {
    if (!transferData.fromWarehouseId || !transferData.toWarehouseId || !transferData.productId || transferData.quantity < 1) {
      alert('Please fill all transfer fields');
      return;
    }
    setTransfering(true);
    try {
      await warehouseService.transferStock(transferData);
      setSuccessMsg('Stock transferred successfully!');
      setShowTransferModal(false);
      await fetchWarehouses();
    } catch (err) {
      alert(`Transfer failed: ${err.response?.data?.message || err.message}`);
    } finally { setTransfering(false); }
  };

  // Delete
  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await warehouseService.deleteWarehouse(deleteTarget.warehouseId);
      setSuccessMsg(`Warehouse "${deleteTarget.name}" deleted.`);
      setShowDeleteModal(false); setDeleteTarget(null);
      await fetchWarehouses();
    } catch (err) {
      setError(`Delete failed: ${err.response?.data?.message || err.message}`);
      setShowDeleteModal(false);
    } finally { setDeleting(false); }
  };

  const getUtilization = (wh) => {
    if (!wh.capacity) return 0;
    return Math.round(((wh.usedCapacity || 0) / wh.capacity) * 100);
  };

  const getUtilColor = (pct) => {
    if (pct >= 90) return 'danger';
    if (pct >= 70) return 'warning';
    return 'primary';
  };

  // Form field helper
  const renderField = (label, name, type = 'text', placeholder = '', required = false) => (
    <div className="mb-3">
      <label className="form-label small fw-bold text-secondary">
        {label} {required && <span className="text-danger">*</span>}
      </label>
      <input type={type} className={`form-control ${formErrors[name] ? 'is-invalid' : ''}`}
        name={name} value={formData[name]} onChange={handleInputChange} placeholder={placeholder}
        step={type === 'number' ? '1' : undefined}
      />
      {formErrors[name] && <div className="invalid-feedback">{formErrors[name]}</div>}
    </div>
  );

  return (
    <div>
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-0">Warehouses</h2>
          <p className="text-muted mb-0">
            Manage storage locations and capacity.
            {!loading && <span className="ms-1 text-primary fw-medium">({warehouses.length} locations)</span>}
          </p>
        </div>
        <div className="d-flex gap-2">
          <button className="btn btn-outline-primary d-flex align-items-center gap-2 shadow-sm" onClick={() => openTransferModal()}>
            <ArrowRightLeft size={18} /> Transfer Stock
          </button>
          <button className="btn btn-primary d-flex align-items-center gap-2 shadow-sm" onClick={openAddModal}>
            <Plus size={18} /> Register Warehouse
          </button>
        </div>
      </div>

      {/* Alerts */}
      {successMsg && (
        <div className="alert alert-success border-0 shadow-sm mb-4 d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center gap-2">
            <span className="material-symbols-outlined text-success">check_circle</span>{successMsg}
          </div>
          <button className="btn btn-sm btn-close" onClick={() => setSuccessMsg(null)}></button>
        </div>
      )}
      {error && (
        <div className="alert alert-danger border-0 shadow-sm mb-4 d-flex justify-content-between align-items-center">
          <div>{error}</div>
          <button className="btn btn-sm btn-close" onClick={() => setError(null)}></button>
        </div>
      )}

      {/* Loading */}
      {loading ? (
        <div className="text-center py-5">
          <Loader className="animate-spin text-primary mx-auto mb-2" />
          <p className="text-muted small">Loading warehouses...</p>
        </div>
      ) : warehouses.length === 0 ? (
        <div className="text-center py-5 text-muted">
          <Package size={48} className="mb-3 opacity-50" />
          <p>No warehouses found. Click "Register Warehouse" to add one.</p>
        </div>
      ) : (
        /* Warehouse Cards */
        <div className="row g-4">
          {warehouses.map(wh => {
            const util = getUtilization(wh);
            const color = getUtilColor(util);
            return (
              <div className="col-md-6 col-lg-4" key={wh.warehouseId}>
                <div className="card border-0 shadow-sm h-100">
                  <div className="card-body">
                    {/* Header */}
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <div>
                        <h5 className="card-title fw-bold mb-0">{wh.name}</h5>
                        <p className="text-muted small mb-0 mt-1">{wh.location}</p>
                      </div>
                      <span className={`badge ${wh.isActive !== false ? 'bg-success-subtle text-success' : 'bg-secondary-subtle text-secondary'} rounded-pill`}>
                        {wh.isActive !== false ? 'Active' : 'Inactive'}
                      </span>
                    </div>

                    {/* Address */}
                    {wh.address && <p className="small text-muted mb-3">{wh.address}</p>}

                    {/* Capacity Bar */}
                    <div className="mb-3">
                      <div className="d-flex justify-content-between small mb-1">
                        <span className="text-muted">Capacity Utilization</span>
                        <span className={`fw-bold text-${color}`}>{util}%</span>
                      </div>
                      <div className="progress" style={{ height: '8px' }}>
                        <div className={`progress-bar bg-${color}`} style={{ width: `${util}%` }}></div>
                      </div>
                      <div className="small text-muted mt-1">
                        {(wh.usedCapacity || 0).toLocaleString()} / {(wh.capacity || 0).toLocaleString()} units
                      </div>
                    </div>

                    {/* Info */}
                    {wh.phone && (
                      <div className="small mb-2">
                        <span className="text-muted">Phone: </span>
                        <span className="fw-medium">{wh.phone}</span>
                      </div>
                    )}
                    <div className="small mb-3">
                      <span className="text-muted">Manager ID: </span>
                      <span className="fw-medium">{wh.managerId}</span>
                    </div>

                    {/* Action Buttons */}
                    <div className="d-flex gap-2 pt-3 border-top">
                      <button className="btn btn-sm btn-outline-primary flex-grow-1 d-flex align-items-center justify-content-center gap-1"
                        onClick={() => openStockView(wh)}>
                        <Package size={14} /> View Stock
                      </button>
                      <button className="btn btn-sm btn-outline-secondary" title="Transfer From" onClick={() => openTransferModal(wh.warehouseId)}>
                        <ArrowRightLeft size={14} />
                      </button>
                      <button className="btn btn-sm btn-light" title="Edit" onClick={() => openEditModal(wh)}>
                        <Edit size={15} className="text-secondary" />
                      </button>
                      <button className="btn btn-sm btn-light" title="Delete"
                        onClick={() => { setDeleteTarget(wh); setShowDeleteModal(true); }}>
                        <Trash2 size={15} className="text-danger" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ===== ADD/EDIT MODAL ===== */}
      {showModal && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} onClick={closeModal}>
          <div className="modal-dialog modal-dialog-centered" onClick={e => e.stopPropagation()}>
            <div className="modal-content border-0 shadow">
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title fw-bold">
                  {modalMode === 'add' ? '🏭 Register New Warehouse' : '✏️ Edit Warehouse'}
                </h5>
                <button className="btn btn-sm btn-light rounded-circle" onClick={closeModal}><X size={18} /></button>
              </div>
              <div className="modal-body pt-2">
                {formErrors._server && <div className="alert alert-danger small py-2 mb-3">{formErrors._server}</div>}
                {renderField('Warehouse Name', 'name', 'text', 'e.g. Main Distribution Center', true)}
                {renderField('Location (City)', 'location', 'text', 'e.g. New York, NY', true)}
                {renderField('Full Address', 'address', 'text', 'e.g. 123 Warehouse Ave, NY 10001', true)}
                <div className="row">
                  <div className="col-md-6">{renderField('Capacity (units)', 'capacity', 'number', '1000', true)}</div>
                  <div className="col-md-6">{renderField('Manager ID', 'managerId', 'number', '1')}</div>
                </div>
                {renderField('Phone', 'phone', 'text', '+1 555-0123')}
              </div>
              <div className="modal-footer border-0 pt-0">
                <button className="btn btn-light" onClick={closeModal}>Cancel</button>
                <button className="btn btn-primary d-flex align-items-center gap-2" onClick={handleSave} disabled={saving}>
                  {saving ? <><Loader size={16} className="animate-spin" /> Saving...</> : modalMode === 'add' ? 'Register Warehouse' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== STOCK VIEW MODAL ===== */}
      {showStockModal && stockWarehouse && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} onClick={() => setShowStockModal(false)}>
          <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable" onClick={e => e.stopPropagation()}>
            <div className="modal-content border-0 shadow">
              <div className="modal-header border-0">
                <div>
                  <h5 className="modal-title fw-bold">📦 Stock Levels — {stockWarehouse.name}</h5>
                  <p className="text-muted small mb-0">{stockWarehouse.location}</p>
                </div>
                <button className="btn btn-sm btn-light rounded-circle" onClick={() => setShowStockModal(false)}><X size={18} /></button>
              </div>
              <div className="modal-body p-0">
                {stockLoading ? (
                  <div className="text-center py-5">
                    <Loader className="animate-spin text-primary" /><p className="text-muted small mt-2">Loading stock data...</p>
                  </div>
                ) : stockItems.length === 0 ? (
                  <div className="text-center py-5 text-muted">
                    <Package size={40} className="mb-2 opacity-50" /><p>No stock records found for this warehouse.</p>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                      <thead className="table-light">
                        <tr>
                          <th className="ps-4">Product ID</th>
                          <th className="text-end">Quantity</th>
                          <th className="text-end">Reserved</th>
                          <th className="text-end">Available</th>
                          <th>Location</th>
                          <th className="pe-4">Last Updated</th>
                        </tr>
                      </thead>
                      <tbody>
                        {stockItems.map((item, i) => (
                          <tr key={i}>
                            <td className="ps-4 fw-medium text-primary font-monospace">PROD-{item.productId}</td>
                            <td className="text-end font-monospace fw-bold">{item.quantity}</td>
                            <td className="text-end font-monospace text-warning">{item.reservedQuantity}</td>
                            <td className="text-end font-monospace text-success fw-bold">{item.availableQuantity}</td>
                            <td className="text-muted small">{item.location || '—'}</td>
                            <td className="pe-4 text-muted small">{item.lastUpdated ? new Date(item.lastUpdated).toLocaleDateString() : '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
              <div className="modal-footer border-0">
                <span className="text-muted small me-auto">{stockItems.length} stock record(s)</span>
                <button className="btn btn-light" onClick={() => setShowStockModal(false)}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== STOCK TRANSFER MODAL ===== */}
      {showTransferModal && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} onClick={() => setShowTransferModal(false)}>
          <div className="modal-dialog modal-dialog-centered" onClick={e => e.stopPropagation()}>
            <div className="modal-content border-0 shadow">
              <div className="modal-header border-0">
                <h5 className="modal-title fw-bold">🔄 Transfer Stock</h5>
                <button className="btn btn-sm btn-light rounded-circle" onClick={() => setShowTransferModal(false)}><X size={18} /></button>
              </div>
              <div className="modal-body pt-2">
                <div className="mb-3">
                  <label className="form-label small fw-bold text-secondary">Source Warehouse</label>
                  <select className="form-select" value={transferData.fromWarehouseId} 
                    onChange={e => setTransferData({...transferData, fromWarehouseId: e.target.value})}>
                    <option value="">Select source...</option>
                    {warehouses.map(wh => <option key={wh.warehouseId} value={wh.warehouseId}>{wh.name}</option>)}
                  </select>
                </div>
                <div className="mb-3">
                  <label className="form-label small fw-bold text-secondary">Destination Warehouse</label>
                  <select className="form-select" value={transferData.toWarehouseId} 
                    onChange={e => setTransferData({...transferData, toWarehouseId: e.target.value})}>
                    <option value="">Select destination...</option>
                    {warehouses.map(wh => (
                      wh.warehouseId != transferData.fromWarehouseId && <option key={wh.warehouseId} value={wh.warehouseId}>{wh.name}</option>
                    ))}
                  </select>
                </div>
                <div className="row">
                  <div className="col-md-7">
                    <div className="mb-3">
                      <label className="form-label small fw-bold text-secondary">Product ID</label>
                      <input type="number" className="form-control" placeholder="Enter Product ID"
                        value={transferData.productId} onChange={e => setTransferData({...transferData, productId: e.target.value})} />
                    </div>
                  </div>
                  <div className="col-md-5">
                    <div className="mb-3">
                      <label className="form-label small fw-bold text-secondary">Quantity</label>
                      <input type="number" className="form-control" min="1"
                        value={transferData.quantity} onChange={e => setTransferData({...transferData, quantity: e.target.value})} />
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer border-0 pt-0">
                <button className="btn btn-light" onClick={() => setShowTransferModal(false)}>Cancel</button>
                <button className="btn btn-primary d-flex align-items-center gap-2" onClick={handleTransfer} disabled={transfering}>
                  {transfering ? <><Loader size={16} className="animate-spin" /> Transferring...</> : 'Execute Transfer'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== DELETE MODAL ===== */}
      {showDeleteModal && deleteTarget && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} onClick={() => setShowDeleteModal(false)}>
          <div className="modal-dialog modal-dialog-centered modal-sm" onClick={e => e.stopPropagation()}>
            <div className="modal-content border-0 shadow">
              <div className="modal-body text-center py-4">
                <div className="mb-3">
                  <div className="bg-danger-subtle rounded-circle d-inline-flex align-items-center justify-content-center" style={{ width: '64px', height: '64px' }}>
                    <Trash2 size={28} className="text-danger" />
                  </div>
                </div>
                <h5 className="fw-bold mb-2">Delete Warehouse?</h5>
                <p className="text-muted small mb-0">
                  Are you sure you want to delete <strong>"{deleteTarget.name}"</strong>? This will deactivate it.
                </p>
              </div>
              <div className="modal-footer border-0 justify-content-center pt-0 gap-2">
                <button className="btn btn-light px-4" onClick={() => setShowDeleteModal(false)}>Cancel</button>
                <button className="btn btn-danger px-4 d-flex align-items-center gap-2" onClick={handleDelete} disabled={deleting}>
                  {deleting ? <><Loader size={16} className="animate-spin" /> Deleting...</> : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WarehousesPage;
