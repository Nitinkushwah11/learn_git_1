package com.stockpro.alert.service.impl;

import com.stockpro.alert.dto.AlertRequestDTO;
import com.stockpro.alert.dto.AlertResponseDTO;
import com.stockpro.alert.entity.Alert;
import com.stockpro.alert.entity.AlertSeverity;
import com.stockpro.alert.entity.AlertType;
import com.stockpro.alert.exception.ResourceNotFoundException;
import com.stockpro.alert.repository.AlertRepository;
import com.stockpro.alert.service.AlertService;
import lombok.RequiredArgsConstructor;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AlertServiceImpl implements AlertService {

    private final AlertRepository alertRepository;
    private final JavaMailSender emailSender;

    @Override
    @Transactional
    public AlertResponseDTO sendAlert(AlertRequestDTO requestDTO) {
        Alert alert = Alert.builder()
                .recipientId(requestDTO.getRecipientId())
                .type(requestDTO.getType())
                .severity(requestDTO.getSeverity())
                .title(requestDTO.getTitle())
                .message(requestDTO.getMessage())
                .relatedProductId(requestDTO.getRelatedProductId())
                .relatedWarehouseId(requestDTO.getRelatedWarehouseId())
                .channel(requestDTO.getChannel())
                .isRead(false)
                .isAcknowledged(false)
                .build();
                
        Alert saved = alertRepository.save(alert);
        
        if (alert.getSeverity() == AlertSeverity.CRITICAL) {
            sendEmail("admin@stockpro.com", "CRITICAL ALERT: " + alert.getTitle(), alert.getMessage());
        }
        
        return toDTO(saved);
    }

    @Override
    @Transactional
    public void sendLowStockAlert(Long productId, Long warehouseId) {
        Alert alert = Alert.builder()
                .recipientId(1L)
                .type(AlertType.LOW_STOCK)
                .severity(AlertSeverity.WARNING)
                .title("Low Stock Warning")
                .message("Product " + productId + " is low on stock in warehouse " + warehouseId)
                .relatedProductId(productId)
                .relatedWarehouseId(warehouseId)
                .channel("IN_APP")
                .isRead(false)
                .isAcknowledged(false)
                .build();
        alertRepository.save(alert);
    }

    @Override
    @Transactional
    public void sendBulk(List<Long> recipientIds, String title, String message) {
        for (Long recipientId : recipientIds) {
            Alert alert = Alert.builder()
                    .recipientId(recipientId)
                    .type(AlertType.SYSTEM)
                    .severity(AlertSeverity.INFO)
                    .title(title)
                    .message(message)
                    .channel("IN_APP")
                    .isRead(false)
                    .isAcknowledged(false)
                    .build();
            alertRepository.save(alert);
        }
    }

    @Override
    @Transactional
    public void markAsRead(Long alertId) {
        Alert alert = alertRepository.findById(alertId)
                .orElseThrow(() -> new ResourceNotFoundException("Alert not found with id: " + alertId));
        alert.setRead(true);
        alertRepository.save(alert);
    }

    @Override
    @Transactional
    public void markAllRead(Long recipientId) {
        List<Alert> alerts = alertRepository.findByRecipientIdAndIsRead(recipientId, false);
        alerts.forEach(a -> a.setRead(true));
        alertRepository.saveAll(alerts);
    }

    @Override
    @Transactional
    public void acknowledge(Long alertId) {
        Alert alert = alertRepository.findById(alertId)
                .orElseThrow(() -> new ResourceNotFoundException("Alert not found with id: " + alertId));
        alert.setAcknowledged(true);
        alertRepository.save(alert);
    }

    @Override
    public List<AlertResponseDTO> getByRecipient(Long recipientId) {
        List<Alert> alerts = alertRepository.findByRecipientId(recipientId);
        if (alerts.isEmpty()) {
            throw new ResourceNotFoundException("No alerts found for recipient: " + recipientId);
        }
        return alerts.stream().map(this::toDTO).collect(Collectors.toList());
    }

    @Override
    public int getUnreadCount(Long recipientId) {
        return alertRepository.countByRecipientIdAndIsRead(recipientId, false);
    }

    @Override
    public List<AlertResponseDTO> getUnacknowledged() {
        List<Alert> alerts = alertRepository.findUnacknowledged();
        if (alerts.isEmpty()) {
            throw new ResourceNotFoundException("No unacknowledged alerts found");
        }
        return alerts.stream().map(this::toDTO).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void deleteAlert(Long alertId) {
        if (!alertRepository.existsById(alertId)) {
            throw new ResourceNotFoundException("Alert not found with id: " + alertId);
        }
        alertRepository.deleteByAlertId(alertId);
    }

    @Override
    public void sendEmail(String to, String subject, String body) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject(subject);
        message.setText(body);
        message.setFrom("noreply@stockpro.com");
        
        try {
            emailSender.send(message);
        } catch (Exception e) {
            System.err.println("Failed to send email: " + e.getMessage());
        }
    }

    @Override
    public List<AlertResponseDTO> getAll() {
        List<Alert> alerts = alertRepository.findAll();
        if (alerts.isEmpty()) {
            throw new ResourceNotFoundException("No alerts found");
        }
        return alerts.stream().map(this::toDTO).collect(Collectors.toList());
    }

    private AlertResponseDTO toDTO(Alert alert) {
        return AlertResponseDTO.builder()
                .alertId(alert.getAlertId())
                .recipientId(alert.getRecipientId())
                .type(alert.getType())
                .severity(alert.getSeverity())
                .title(alert.getTitle())
                .message(alert.getMessage())
                .relatedProductId(alert.getRelatedProductId())
                .relatedWarehouseId(alert.getRelatedWarehouseId())
                .channel(alert.getChannel())
                .isRead(alert.isRead())
                .isAcknowledged(alert.isAcknowledged())
                .createdAt(alert.getCreatedAt())
                .build();
    }
}
