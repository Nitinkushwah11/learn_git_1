import { supplierApi } from './api';

export const supplierService = {
    // Get all active suppliers
    getAllSuppliers: async () => {
        const response = await supplierApi.get('/suppliers');
        return response.data;
    },

    // Get a specific supplier
    getSupplierById: async (id) => {
        const response = await supplierApi.get(`/suppliers/${id}`);
        return response.data;
    },

    // Create a new supplier
    createSupplier: async (supplierData) => {
        const response = await supplierApi.post('/suppliers', supplierData);
        return response.data;
    },

    // Update a supplier
    updateSupplier: async (id, supplierData) => {
        const response = await supplierApi.put(`/suppliers/${id}`, supplierData);
        return response.data;
    },

    // Delete (soft) a supplier
    deleteSupplier: async (id) => {
        const response = await supplierApi.delete(`/suppliers/${id}`);
        return response.data;
    }
};
