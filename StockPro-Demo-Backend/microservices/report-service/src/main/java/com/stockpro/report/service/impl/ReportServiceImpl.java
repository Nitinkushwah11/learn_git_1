package com.stockpro.report.service.impl;

import com.stockpro.report.dto.SnapshotResponseDTO;
import com.stockpro.report.entity.InventorySnapshot;
import com.stockpro.report.exception.ResourceNotFoundException;
import com.stockpro.report.repository.ReportRepository;
import com.stockpro.report.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReportServiceImpl implements ReportService {

    private final ReportRepository reportRepository;

    @Override
    public SnapshotResponseDTO takeSnapshot(Long warehouseId, Long productId, int quantity, double unitCost) {
        InventorySnapshot snapshot = InventorySnapshot.builder()
                .warehouseId(warehouseId)
                .productId(productId)
                .quantity(quantity)
                .stockValue(quantity * unitCost)
                .snapshotDate(LocalDate.now())
                .build();
        return toDTO(reportRepository.save(snapshot));
    }

    @Override
    public Map<String, Object> getInventoryValuation() {
        LocalDate latestDate = reportRepository.findLatestSnapshotDate().orElse(LocalDate.now());
        Double total = reportRepository.sumTotalStockValue(latestDate).orElse(0.0);
        return Map.of(
            "totalValuation", total,
            "currency", "USD",
            "lastUpdated", latestDate.toString()
        );
    }

    @Override
    public List<Map<String, Object>> getInventoryTurnoverSummary() {
        return List.of(
            Map.of("productId", 1, "turnoverRate", 5.2),
            Map.of("productId", 2, "turnoverRate", 3.1),
            Map.of("productId", 3, "turnoverRate", 0.8)
        );
    }

    @Override
    public List<Map<String, Object>> getMovementVelocity() {
        // Matches ReportsPage.jsx fields: productId, averageDailySales
        return List.of(
            Map.of("productId", 1, "averageDailySales", 12.5, "status", "Fast Mover"),
            Map.of("productId", 2, "averageDailySales", 3.2, "status", "Stable"),
            Map.of("productId", 3, "averageDailySales", 0.5, "status", "Slow Mover")
        );
    }

    @Override
    public List<Map<String, Object>> getWarehouseUtilization() {
        // Matches ReportsPage.jsx fields: warehouseName, utilizationPercentage, totalQuantity, totalCapacity
        return List.of(
            Map.of("warehouseName", "Main Warehouse", "utilizationPercentage", 65.0, "totalQuantity", 4500, "totalCapacity", 7000),
            Map.of("warehouseName", "Regional Hub", "utilizationPercentage", 88.0, "totalQuantity", 1760, "totalCapacity", 2000)
        );
    }
    
    // Additional list for turnover card
    @Override
    public Map<String, Object> getPOSummary(LocalDate startDate, LocalDate endDate) {
        return Map.of("totalSpend", 25000.0);
    }

    @Override
    public Double getTotalStockValue(LocalDate date) {
        return reportRepository.sumTotalStockValue(date).orElse(0.0);
    }

    @Override
    public Double getStockValueByWarehouse(Long warehouseId, LocalDate date) {
        return reportRepository.sumStockValueByWarehouse(warehouseId, date).orElse(0.0);
    }

    @Override
    public Double getInventoryTurnover(Long productId, LocalDate startDate, LocalDate endDate) {
        return reportRepository.avgTurnoverByProduct(productId, startDate, endDate).orElse(0.0);
    }
    
    // New method to satisfy the getTurnover() call which expects a LIST of turnover records
    public List<Map<String, Object>> getTurnoverReport() {
        return List.of(
            Map.of("productId", 1, "turnoverRate", 5.2),
            Map.of("productId", 2, "turnoverRate", 3.1),
            Map.of("productId", 3, "turnoverRate", 0.8)
        );
    }

    @Override
    public List<SnapshotResponseDTO> getLowStockReport(Long warehouseId, int threshold) {
        return reportRepository.findLowStockSnapshot(warehouseId, threshold).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public Map<String, Object> getStockMovementsSummary(Long warehouseId) {
        return Map.of("warehouseId", warehouseId, "summary", "Aggregate movement metrics");
    }

    @Override
    public List<SnapshotResponseDTO> getTopMovingProducts(Long warehouseId) {
        return reportRepository.findByWarehouseId(warehouseId).stream()
                .limit(5)
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<SnapshotResponseDTO> getSlowMovingProducts(Long warehouseId) {
        return reportRepository.findByWarehouseId(warehouseId).stream()
                .skip(Math.max(0, reportRepository.findByWarehouseId(warehouseId).size() - 5))
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public Map<String, Object> generateInventoryReport(Long warehouseId) {
        return Map.of("warehouseId", warehouseId, "generatedAt", LocalDate.now());
    }

    @Override
    public List<SnapshotResponseDTO> getDeadStock(Long warehouseId) {
        return new ArrayList<>();
    }

    private SnapshotResponseDTO toDTO(InventorySnapshot s) {
        return SnapshotResponseDTO.builder()
                .snapshotId(s.getSnapshotId())
                .warehouseId(s.getWarehouseId())
                .productId(s.getProductId())
                .quantity(s.getQuantity())
                .stockValue(s.getStockValue())
                .snapshotDate(s.getSnapshotDate())
                .createdAt(s.getCreatedAt())
                .build();
    }
}
