import { reportApi } from './api';

export const reportService = {
    // Get inventory valuation report
    getValuation: async () => {
        const response = await reportApi.get('/reports/inventory/valuation');
        return response.data;
    },

    // Get stock turnover report
    getTurnover: async () => {
        const response = await reportApi.get('/reports/inventory/turnover');
        return response.data;
    },

    // Get movement velocity report
    getVelocity: async () => {
        const response = await reportApi.get('/reports/inventory/velocity');
        return response.data;
    },

    // Get warehouse utilization report
    getUtilization: async () => {
        const response = await reportApi.get('/reports/warehouse/utilization');
        return response.data;
    }
};
