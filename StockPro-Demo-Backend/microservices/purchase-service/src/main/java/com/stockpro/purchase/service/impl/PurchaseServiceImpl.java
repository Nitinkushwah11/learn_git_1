package com.stockpro.purchase.service.impl;

import com.stockpro.purchase.dto.PartialReceiptItemDTO;
import com.stockpro.purchase.dto.PurchaseOrderRequestDTO;
import com.stockpro.purchase.dto.PurchaseOrderResponseDTO;
import com.stockpro.purchase.entity.POLineItem;
import com.stockpro.purchase.entity.POStatus;
import com.stockpro.purchase.entity.PurchaseOrder;
import com.stockpro.purchase.config.RabbitMQConfig;
import com.stockpro.purchase.event.GoodsReceivedEvent;
import com.stockpro.purchase.exception.ResourceNotFoundException;
import com.stockpro.purchase.repository.PurchaseRepository;
import com.stockpro.purchase.service.PurchaseService;
import lombok.RequiredArgsConstructor;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PurchaseServiceImpl implements PurchaseService {

    private final PurchaseRepository purchaseRepository;
    private final RabbitTemplate rabbitTemplate;

    @Override
    public List<PurchaseOrderResponseDTO> getAllPOs() {
        return purchaseRepository.findAll().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public PurchaseOrderResponseDTO createPO(PurchaseOrderRequestDTO requestDTO) {
        PurchaseOrder po = PurchaseOrder.builder()
                .supplierId(requestDTO.getSupplierId())
                .warehouseId(requestDTO.getWarehouseId())
                .createdById(requestDTO.getCreatedById())
                .expectedDate(requestDTO.getExpectedDate())
                .notes(requestDTO.getNotes())
                .referenceNumber(requestDTO.getReferenceNumber())
                .status(POStatus.PENDING_APPROVAL)
                .build();

        double totalAmount = 0.0;
        for (var itemDTO : requestDTO.getLineItems()) {
            double totalCost = itemDTO.getQuantity() * itemDTO.getUnitCost();
            totalAmount += totalCost;
            POLineItem lineItem = POLineItem.builder()
                    .productId(itemDTO.getProductId())
                    .quantity(itemDTO.getQuantity())
                    .unitCost(itemDTO.getUnitCost())
                    .totalCost(totalCost)
                    .receivedQty(0)
                    .build();
            po.addLineItem(lineItem);
        }

        po.setTotalAmount(totalAmount);
        return mapToDTO(purchaseRepository.save(po));
    }

    @Override
    public PurchaseOrderResponseDTO getPOById(Integer poId) {
        return mapToDTO(purchaseRepository.findById(poId)
                .orElseThrow(() -> new ResourceNotFoundException("Purchase Order not found with ID: " + poId)));
    }

    @Override
    public List<PurchaseOrderResponseDTO> getPOsByStatus(POStatus status) {
        return purchaseRepository.findByStatus(status).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public PurchaseOrderResponseDTO approvePO(Integer poId) {
        PurchaseOrder po = purchaseRepository.findById(poId)
                .orElseThrow(() -> new ResourceNotFoundException("Purchase Order not found with ID: " + poId));
        if (po.getStatus() != POStatus.PENDING_APPROVAL && po.getStatus() != POStatus.DRAFT) {
            throw new RuntimeException("Only Draft or Pending POs can be approved");
        }
        po.setStatus(POStatus.APPROVED);
        return mapToDTO(purchaseRepository.save(po));
    }

    @Override
    @Transactional
    public PurchaseOrderResponseDTO cancelPO(Integer poId) {
        PurchaseOrder po = purchaseRepository.findById(poId)
                .orElseThrow(() -> new ResourceNotFoundException("Purchase Order not found with ID: " + poId));
        if (po.getStatus() == POStatus.RECEIVED) {
            throw new RuntimeException("Cannot cancel a PO that has already been received");
        }
        po.setStatus(POStatus.CANCELLED);
        return mapToDTO(purchaseRepository.save(po));
    }

    @Override
    public List<PurchaseOrderResponseDTO> getPOsBySupplier(Integer supplierId) {
        return purchaseRepository.findBySupplierId(supplierId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<PurchaseOrderResponseDTO> getPOsByWarehouse(Integer warehouseId) {
        return purchaseRepository.findByWarehouseId(warehouseId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<PurchaseOrderResponseDTO> getPOsByDateRange(java.time.LocalDate startDate, java.time.LocalDate endDate) {
        return purchaseRepository.findByOrderDateBetween(startDate, endDate).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public PurchaseOrderResponseDTO updatePO(Integer poId, PurchaseOrderRequestDTO requestDTO) {
        PurchaseOrder po = purchaseRepository.findById(poId)
                .orElseThrow(() -> new ResourceNotFoundException("Purchase Order not found with ID: " + poId));
        if (po.getStatus() != POStatus.DRAFT && po.getStatus() != POStatus.PENDING_APPROVAL) {
            throw new RuntimeException("Cannot update PO that is already processed");
        }

        po.setSupplierId(requestDTO.getSupplierId());
        po.setWarehouseId(requestDTO.getWarehouseId());
        po.setExpectedDate(requestDTO.getExpectedDate());
        po.setNotes(requestDTO.getNotes());
        po.setReferenceNumber(requestDTO.getReferenceNumber());
        po.getLineItems().clear();

        double totalAmount = 0.0;
        for (var itemDTO : requestDTO.getLineItems()) {
            double totalCost = itemDTO.getQuantity() * itemDTO.getUnitCost();
            totalAmount += totalCost;
            POLineItem lineItem = POLineItem.builder()
                    .productId(itemDTO.getProductId())
                    .quantity(itemDTO.getQuantity())
                    .unitCost(itemDTO.getUnitCost())
                    .totalCost(totalCost)
                    .receivedQty(0)
                    .build();
            po.addLineItem(lineItem);
        }

        po.setTotalAmount(totalAmount);
        return mapToDTO(purchaseRepository.save(po));
    }

    @Override
    @Transactional
    public PurchaseOrderResponseDTO receiveGoods(Integer poId) {
        PurchaseOrder po = purchaseRepository.findById(poId)
                .orElseThrow(() -> new ResourceNotFoundException("Purchase Order not found with ID: " + poId));
        if (po.getStatus() != POStatus.APPROVED && po.getStatus() != POStatus.PARTIALLY_RECEIVED) {
            throw new RuntimeException("PO must be APPROVED or PARTIALLY_RECEIVED to receive goods");
        }

        po.setStatus(POStatus.RECEIVED);
        po.setReceivedDate(java.time.LocalDateTime.now());
        po.getLineItems().forEach(item -> item.setReceivedQty(item.getQuantity()));

        for (POLineItem item : po.getLineItems()) {
            GoodsReceivedEvent event = GoodsReceivedEvent.builder()
                    .poId(po.getPoId())
                    .warehouseId(po.getWarehouseId())
                    .productId(item.getProductId())
                    .quantity(item.getQuantity())
                    .unitCost(item.getUnitCost())
                    .build();
            rabbitTemplate.convertAndSend(
                    RabbitMQConfig.EXCHANGE,
                    RabbitMQConfig.GOODS_RECEIVED_KEY,
                    event
            );
        }

        return mapToDTO(purchaseRepository.save(po));
    }

    @Override
    @Transactional
    public PurchaseOrderResponseDTO receiveGoodsPartially(Integer poId, List<PartialReceiptItemDTO> items) {
        PurchaseOrder po = purchaseRepository.findById(poId)
                .orElseThrow(() -> new ResourceNotFoundException("Purchase Order not found with ID: " + poId));

        if (po.getStatus() != POStatus.APPROVED && po.getStatus() != POStatus.PARTIALLY_RECEIVED) {
            throw new RuntimeException("PO must be APPROVED or PARTIALLY_RECEIVED to receive goods");
        }

        Map<Integer, Integer> receiptMap = items.stream()
                .collect(Collectors.toMap(PartialReceiptItemDTO::getLineItemId, PartialReceiptItemDTO::getReceivedQty));

        for (POLineItem lineItem : po.getLineItems()) {
            Integer incomingQty = receiptMap.get(lineItem.getLineItemId());
            if (incomingQty == null) continue;

            int newReceivedQty = lineItem.getReceivedQty() + incomingQty;
            if (newReceivedQty > lineItem.getQuantity()) {
                throw new RuntimeException("Received quantity exceeds ordered quantity");
            }
            lineItem.setReceivedQty(newReceivedQty);
        }

        boolean fullyReceived = po.getLineItems().stream()
                .allMatch(item -> item.getReceivedQty() >= item.getQuantity());

        po.setStatus(fullyReceived ? POStatus.RECEIVED : POStatus.PARTIALLY_RECEIVED);
        if (fullyReceived) {
            po.setReceivedDate(java.time.LocalDateTime.now());
        }

        for (POLineItem item : po.getLineItems()) {
            Integer incomingQty = receiptMap.get(item.getLineItemId());
            if (incomingQty != null && incomingQty > 0) {
                GoodsReceivedEvent event = GoodsReceivedEvent.builder()
                        .poId(po.getPoId())
                        .warehouseId(po.getWarehouseId())
                        .productId(item.getProductId())
                        .quantity(incomingQty)
                        .unitCost(item.getUnitCost())
                        .build();
                rabbitTemplate.convertAndSend(
                        RabbitMQConfig.EXCHANGE,
                        RabbitMQConfig.GOODS_RECEIVED_KEY,
                        event
                );
            }
        }

        return mapToDTO(purchaseRepository.save(po));
    }

    private PurchaseOrderResponseDTO mapToDTO(PurchaseOrder po) {
        List<PurchaseOrderResponseDTO.POLineItemResponseDTO> items = po.getLineItems().stream()
                .map(item -> PurchaseOrderResponseDTO.POLineItemResponseDTO.builder()
                        .lineItemId(item.getLineItemId())
                        .productId(item.getProductId())
                        .quantity(item.getQuantity())
                        .unitCost(item.getUnitCost())
                        .totalCost(item.getTotalCost())
                        .receivedQty(item.getReceivedQty())
                        .build())
                .collect(Collectors.toList());

        return PurchaseOrderResponseDTO.builder()
                .poId(po.getPoId())
                .supplierId(po.getSupplierId())
                .warehouseId(po.getWarehouseId())
                .createdById(po.getCreatedById())
                .status(po.getStatus())
                .totalAmount(po.getTotalAmount())
                .orderDate(po.getOrderDate())
                .expectedDate(po.getExpectedDate())
                .receivedDate(po.getReceivedDate())
                .notes(po.getNotes())
                .referenceNumber(po.getReferenceNumber())
                .createdAt(po.getCreatedAt())
                .lineItems(items)
                .build();
    }
}