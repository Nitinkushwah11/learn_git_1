import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import DashboardPage from '../pages/dashboard/DashboardPage';
import { warehouseService } from '../services/warehouseService';
import { purchaseService } from '../services/purchaseService';
import { reportService } from '../services/reportService';
import { movementService } from '../services/movementService';
import { supplierService } from '../services/supplierService';
import { vi } from 'vitest';

// Mock the services
vi.mock('../services/warehouseService');
vi.mock('../services/purchaseService');
vi.mock('../services/reportService');
vi.mock('../services/movementService');
vi.mock('../services/supplierService');

describe('DashboardPage', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('renders KPIs successfully with data', async () => {
    // Setup mock return values
    warehouseService.getLowStockItems.mockResolvedValue([
      { productId: 1, productName: 'Test Product', quantity: 2, threshold: 10 }
    ]);
    purchaseService.getPOsByStatus.mockResolvedValue([
      { id: 1, status: 'PENDING_APPROVAL' }
    ]);
    reportService.getValuation.mockResolvedValue({ totalValuation: 15000 });
    reportService.getUtilization.mockResolvedValue([
      { warehouseName: 'Main Hub', utilizationPercentage: 80 }
    ]);
    movementService.getAllMovements.mockResolvedValue([]);
    supplierService.getAllSuppliers.mockResolvedValue([
      { id: 1, name: 'Supplier A', active: true }
    ]);

    render(
      <BrowserRouter>
        <DashboardPage />
      </BrowserRouter>
    );

    // Initial loading state might be brief or show some defaults
    await waitFor(() => {
      expect(screen.getByText('Total Inventory Value')).toBeInTheDocument();
    });

    // Check KPI values after data is loaded
    await waitFor(() => {
      expect(screen.getByText('$15,000')).toBeInTheDocument();
      expect(screen.getByText('1')).toBeInTheDocument(); // 1 supplier
      expect(screen.getByText('1 items')).toBeInTheDocument(); // 1 low stock item
      expect(screen.getByText('1 POs')).toBeInTheDocument(); // 1 pending PO
    });
  });
});
