package com.stockpro.product.service.impl;

import com.stockpro.product.dto.ProductRequestDTO;
import com.stockpro.product.dto.ProductResponseDTO;
import com.stockpro.product.entity.Product;
import com.stockpro.product.exception.ResourceNotFoundException;
import com.stockpro.product.repository.ProductRepository;
import com.stockpro.product.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;

    @Override
    public ProductResponseDTO createProduct(ProductRequestDTO requestDTO) {
        Product product = mapToEntity(requestDTO);
        Product savedProduct = productRepository.save(product);
        return mapToResponseDTO(savedProduct);
    }

    @Override
    public ProductResponseDTO getById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with ID: " + id));
        return mapToResponseDTO(product);
    }

    @Override
    public ProductResponseDTO getBySku(String sku) {
        Product product = productRepository.findBySku(sku)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with SKU: " + sku));
        return mapToResponseDTO(product);
    }

    @Override
    public ProductResponseDTO getByBarcode(String barcode) {
        Product product = productRepository.findByBarcode(barcode)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with Barcode: " + barcode));
        return mapToResponseDTO(product);
    }

    @Override
    public List<ProductResponseDTO> getByCategory(String category) {
        return productRepository.findByCategory(category).stream()
                .map(this::mapToResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<ProductResponseDTO> getByBrand(String brand) {
        return productRepository.findByBrand(brand).stream()
                .map(this::mapToResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<ProductResponseDTO> searchProducts(String name) {
        return productRepository.findByNameContainingIgnoreCase(name).stream()
                .map(this::mapToResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<ProductResponseDTO> getAllProducts() {
        return productRepository.findAll().stream()
                .map(this::mapToResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    public ProductResponseDTO updateProduct(Long id, ProductRequestDTO requestDTO) {
        Product existingProduct = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with ID: " + id));

        existingProduct.setName(requestDTO.getName());
        existingProduct.setDescription(requestDTO.getDescription());
        existingProduct.setCategory(requestDTO.getCategory());
        existingProduct.setBrand(requestDTO.getBrand());
        existingProduct.setUnitOfMeasure(requestDTO.getUnitOfMeasure());
        existingProduct.setCostPrice(requestDTO.getCostPrice());
        existingProduct.setSellingPrice(requestDTO.getSellingPrice());
        existingProduct.setReorderLevel(requestDTO.getReorderLevel());
        existingProduct.setMaxStockLevel(requestDTO.getMaxStockLevel());
        existingProduct.setLeadTimeDays(requestDTO.getLeadTimeDays());
        existingProduct.setImageUrl(requestDTO.getImageUrl());
        
        // Only update unique fields if they are different to avoid constraint violations
        if(!existingProduct.getSku().equals(requestDTO.getSku())) {
            existingProduct.setSku(requestDTO.getSku());
        }
        if(!existingProduct.getBarcode().equals(requestDTO.getBarcode())) {
            existingProduct.setBarcode(requestDTO.getBarcode());
        }

        Product updatedProduct = productRepository.save(existingProduct);
        return mapToResponseDTO(updatedProduct);
    }

    @Override
    public void deactivateProduct(Long id) {
        Product existingProduct = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with ID: " + id));
        existingProduct.setActive(false);
        productRepository.save(existingProduct);
    }

    @Override
    public void deleteProduct(Long id) {
        Product existingProduct = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with ID: " + id));
        // Hard delete per standard DELETE verb, or substitute with soft delete logic if preferred
        productRepository.delete(existingProduct);
    }

    @Override
    public List<ProductResponseDTO> getLowStockProducts() {
        // Placeholder for inter-service communication.
        // True stock values reside in Warehouse-Service.
        // Returning empty list to satisfy the current interface contract.
        return List.of();
    }

    private Product mapToEntity(ProductRequestDTO dto) {
        return Product.builder()
                .sku(dto.getSku())
                .name(dto.getName())
                .description(dto.getDescription())
                .category(dto.getCategory())
                .brand(dto.getBrand())
                .unitOfMeasure(dto.getUnitOfMeasure())
                .costPrice(dto.getCostPrice())
                .sellingPrice(dto.getSellingPrice())
                .reorderLevel(dto.getReorderLevel())
                .maxStockLevel(dto.getMaxStockLevel())
                .leadTimeDays(dto.getLeadTimeDays())
                .imageUrl(dto.getImageUrl())
                .barcode(dto.getBarcode())
                .isActive(true)
                .build();
    }

    private ProductResponseDTO mapToResponseDTO(Product product) {
        return ProductResponseDTO.builder()
                .productId(product.getProductId())
                .sku(product.getSku())
                .name(product.getName())
                .description(product.getDescription())
                .category(product.getCategory())
                .brand(product.getBrand())
                .unitOfMeasure(product.getUnitOfMeasure())
                .costPrice(product.getCostPrice())
                .sellingPrice(product.getSellingPrice())
                .reorderLevel(product.getReorderLevel())
                .maxStockLevel(product.getMaxStockLevel())
                .leadTimeDays(product.getLeadTimeDays())
                .imageUrl(product.getImageUrl())
                .isActive(product.isActive())
                .barcode(product.getBarcode())
                .createdAt(product.getCreatedAt())
                .updatedAt(product.getUpdatedAt())
                .build();
    }
}