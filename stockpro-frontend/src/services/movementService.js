import { movementApi } from './api';

export const movementService = {
    // Get all movements (backend returns a plain list, not paginated)
    getAllMovements: async () => {
        const response = await movementApi.get('/movements');
        return response.data;
    },

    // Get movements for a specific product
    getProductMovements: async (productId) => {
        const response = await movementApi.get(`/movements/product/${productId}`);
        return response.data;
    },

    // Get movements for a specific warehouse
    getWarehouseMovements: async (warehouseId) => {
        const response = await movementApi.get(`/movements/warehouse/${warehouseId}`);
        return response.data;
    }
};
