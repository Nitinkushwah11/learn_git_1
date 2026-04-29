package com.stockpro.warehouse.service.impl;

import com.stockpro.warehouse.dto.StockLevelResponseDTO;
import com.stockpro.warehouse.dto.StockTransferRequestDTO;
import com.stockpro.warehouse.dto.StockUpdateRequestDTO;
import com.stockpro.warehouse.dto.WarehouseRequestDTO;
import com.stockpro.warehouse.dto.WarehouseResponseDTO;
import com.stockpro.warehouse.entity.StockLevel;
import com.stockpro.warehouse.entity.Warehouse;
import com.stockpro.warehouse.exception.ResourceNotFoundException;
import com.stockpro.warehouse.repository.StockLevelRepository;
import com.stockpro.warehouse.repository.WarehouseRepository;
import com.stockpro.warehouse.service.WarehouseService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class WarehouseServiceImpl implements WarehouseService {

    private final WarehouseRepository warehouseRepository;
    private final StockLevelRepository stockLevelRepository;

    // ===================== Warehouse CRUD =====================

    @Override
    public WarehouseResponseDTO createWarehouse(WarehouseRequestDTO requestDTO) {
        Warehouse warehouse = Warehouse.builder()
                .name(requestDTO.getName())
                .location(requestDTO.getLocation())
                .address(requestDTO.getAddress())
                .managerId(requestDTO.getManagerId())
                .capacity(requestDTO.getCapacity())
                .phone(requestDTO.getPhone())
                .isActive(true)
                .build();
        return mapToDTO(warehouseRepository.save(warehouse));
    }

    @Override
    public WarehouseResponseDTO getWarehouseById(Integer id) {
        return mapToDTO(warehouseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Warehouse not found with ID: " + id)));
    }

    @Override
    public List<WarehouseResponseDTO> getAllActiveWarehouses() {
        return warehouseRepository.findByIsActiveTrue().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public WarehouseResponseDTO updateWarehouse(Integer id, WarehouseRequestDTO dto) {
        Warehouse existing = warehouseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Warehouse not found with ID: " + id));
        existing.setName(dto.getName());
        existing.setLocation(dto.getLocation());
        existing.setAddress(dto.getAddress());
        existing.setManagerId(dto.getManagerId());
        existing.setCapacity(dto.getCapacity());
        existing.setPhone(dto.getPhone());
        return mapToDTO(warehouseRepository.save(existing));
    }

    @Override
    public void deleteWarehouse(Integer id) {
        Warehouse existing = warehouseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Warehouse not found with ID: " + id));
        existing.setIsActive(false); // Soft Delete
        warehouseRepository.save(existing);
    }

    // ===================== Stock Level Management =====================

    @Override
    public StockLevelResponseDTO getStockLevel(Long warehouseId, Long productId) {
        StockLevel level = stockLevelRepository.findByWarehouseIdAndProductId(warehouseId, productId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "No stock record found for warehouseId=" + warehouseId + ", productId=" + productId));
        return mapToStockDTO(level);
    }

    @Override
    public List<StockLevelResponseDTO> getStockByWarehouse(Long warehouseId) {
        return stockLevelRepository.findByWarehouseId(warehouseId).stream()
                .map(this::mapToStockDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<StockLevelResponseDTO> getStockByProduct(Long productId) {
        return stockLevelRepository.findByProductId(productId).stream()
                .map(this::mapToStockDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public StockLevelResponseDTO addStock(StockUpdateRequestDTO request) {
        StockLevel level = stockLevelRepository
                .findByWarehouseIdAndProductId(request.getWarehouseId(), request.getProductId())
                .orElse(StockLevel.builder()
                        .warehouseId(request.getWarehouseId())
                        .productId(request.getProductId())
                        .quantity(0)
                        .reservedQuantity(0)
                        .build());
        level.setQuantity(level.getQuantity() + request.getQuantity());
        return mapToStockDTO(stockLevelRepository.save(level));
    }

    @Override
    @Transactional
    public StockLevelResponseDTO deductStock(StockUpdateRequestDTO request) {
        StockLevel level = stockLevelRepository
                .findByWarehouseIdAndProductId(request.getWarehouseId(), request.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("No stock record found to deduct from"));

        int available = level.getQuantity() - level.getReservedQuantity();
        if (available < request.getQuantity()) {
            throw new RuntimeException("Insufficient available stock. Available: " + available
                    + ", Requested: " + request.getQuantity());
        }
        level.setQuantity(level.getQuantity() - request.getQuantity());
        return mapToStockDTO(stockLevelRepository.save(level));
    }

    @Override
    @Transactional
    public StockLevelResponseDTO reserveStock(StockUpdateRequestDTO request) {
        StockLevel level = stockLevelRepository
                .findByWarehouseIdAndProductId(request.getWarehouseId(), request.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("No stock record found to reserve"));

        int available = level.getQuantity() - level.getReservedQuantity();
        if (available < request.getQuantity()) {
            throw new RuntimeException("Insufficient available stock to reserve. Available: " + available
                    + ", Requested: " + request.getQuantity());
        }
        level.setReservedQuantity(level.getReservedQuantity() + request.getQuantity());
        return mapToStockDTO(stockLevelRepository.save(level));
    }

    @Override
    @Transactional
    public StockLevelResponseDTO releaseReservation(StockUpdateRequestDTO request) {
        StockLevel level = stockLevelRepository
                .findByWarehouseIdAndProductId(request.getWarehouseId(), request.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("No stock record found to release reservation"));

        int newReserved = level.getReservedQuantity() - request.getQuantity();
        if (newReserved < 0) {
            throw new RuntimeException("Cannot release more than the reserved quantity. Reserved: "
                    + level.getReservedQuantity() + ", Release requested: " + request.getQuantity());
        }
        level.setReservedQuantity(newReserved);
        return mapToStockDTO(stockLevelRepository.save(level));
    }

    @Override
    @Transactional
    public void transferStock(StockTransferRequestDTO request) {
        // Deduct from source – atomic within same transaction
        StockLevel source = stockLevelRepository
                .findByWarehouseIdAndProductId(request.getFromWarehouseId(), request.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Insufficient stock: The selected product is not available in the source warehouse (Warehouse ID: " + request.getFromWarehouseId() + ")."));

        int available = source.getQuantity() - source.getReservedQuantity();
        if (available < request.getQuantity()) {
            throw new RuntimeException("Insufficient available stock to transfer. Available: " + available
                    + ", Requested: " + request.getQuantity());
        }
        source.setQuantity(source.getQuantity() - request.getQuantity());
        stockLevelRepository.save(source);

        // Add to destination (create if not exists)
        StockLevel destination = stockLevelRepository
                .findByWarehouseIdAndProductId(request.getToWarehouseId(), request.getProductId())
                .orElse(StockLevel.builder()
                        .warehouseId(request.getToWarehouseId())
                        .productId(request.getProductId())
                        .quantity(0)
                        .reservedQuantity(0)
                        .build());
        destination.setQuantity(destination.getQuantity() + request.getQuantity());
        stockLevelRepository.save(destination);
    }

    @Override
    public List<StockLevelResponseDTO> getLowStockItems(int threshold) {
        return stockLevelRepository.findLowStockItems(threshold).stream()
                .map(this::mapToStockDTO)
                .collect(Collectors.toList());
    }

    // ===================== Mappers =====================

    private WarehouseResponseDTO mapToDTO(Warehouse warehouse) {
        return WarehouseResponseDTO.builder()
                .warehouseId(warehouse.getWarehouseId())
                .name(warehouse.getName())
                .location(warehouse.getLocation())
                .address(warehouse.getAddress())
                .managerId(warehouse.getManagerId())
                .capacity(warehouse.getCapacity())
                .usedCapacity(warehouse.getUsedCapacity())
                .phone(warehouse.getPhone())
                .isActive(warehouse.getIsActive())
                .createdAt(warehouse.getCreatedAt())
                .updatedAt(warehouse.getUpdatedAt())
                .build();
    }

    private StockLevelResponseDTO mapToStockDTO(StockLevel level) {
        return StockLevelResponseDTO.builder()
                .stockId(level.getStockId())
                .warehouseId(level.getWarehouseId())
                .productId(level.getProductId())
                .quantity(level.getQuantity())
                .reservedQuantity(level.getReservedQuantity())
                .availableQuantity(level.getAvailableQuantity())
                .location(level.getLocation())
                .lastUpdated(level.getLastUpdated())
                .build();
    }
}