import { productApi } from './api';

export const productService = {
    // Get all products
    getAllProducts: async () => {
        const response = await productApi.get('/products');
        return response.data;
    },

    // Get a specific product by ID
    getProductById: async (id) => {
        const response = await productApi.get(`/products/${id}`);
        return response.data;
    },

    // Create a new product
    createProduct: async (productData) => {
        const response = await productApi.post('/products', productData);
        return response.data;
    },

    // Update an existing product
    updateProduct: async (id, productData) => {
        const response = await productApi.put(`/products/${id}`, productData);
        return response.data;
    },

    // Delete a product (hard delete)
    deleteProduct: async (id) => {
        const response = await productApi.delete(`/products/${id}`);
        return response.data;
    },

    // Deactivate a product (soft delete)
    deactivateProduct: async (id) => {
        const response = await productApi.put(`/products/${id}/deactivate`);
        return response.data;
    },

    // Search products by name
    searchProducts: async (name) => {
        const response = await productApi.get(`/products/search?name=${name}`);
        return response.data;
    },

    // Get products by category
    getByCategory: async (category) => {
        const response = await productApi.get(`/products/category/${category}`);
        return response.data;
    },

    // Get products by brand
    getByBrand: async (brand) => {
        const response = await productApi.get(`/products/brand/${brand}`);
        return response.data;
    },

    // Get low stock products
    getLowStockProducts: async () => {
        const response = await productApi.get('/products/lowStock');
        return response.data;
    }
};
