import { purchaseApi } from './api';

export const purchaseService = {
    // Get all POs
    getAllPOs: async () => {
        const response = await purchaseApi.get('/purchase-orders');
        return response.data;
    },

    // Get PO by ID
    getPOById: async (id) => {
        const response = await purchaseApi.get(`/purchase-orders/${id}`);
        return response.data;
    },

    // Create a new PO
    createPO: async (poData) => {
        const response = await purchaseApi.post('/purchase-orders', poData);
        return response.data;
    },

    // Get POs by status
    getPOsByStatus: async (status) => {
        const response = await purchaseApi.get(`/purchase-orders/status/${status}`);
        return response.data;
    },

    // Approve a PO
    approvePO: async (id) => {
        const response = await purchaseApi.put(`/purchase-orders/${id}/approve`);
        return response.data;
    },

    // Cancel a PO
    cancelPO: async (id) => {
        const response = await purchaseApi.put(`/purchase-orders/${id}/cancel`);
        return response.data;
    },

    // Full Receipt
    receiveGoods: async (id) => {
        const response = await purchaseApi.post(`/purchase-orders/${id}/receive`);
        return response.data;
    },

    // Partial Receipt
    // items should be array of { poItemId, receivedQuantity }
    receiveGoodsPartially: async (id, items) => {
        const response = await purchaseApi.post(`/purchase-orders/${id}/receive/partial`, items);
        return response.data;
    }
};
