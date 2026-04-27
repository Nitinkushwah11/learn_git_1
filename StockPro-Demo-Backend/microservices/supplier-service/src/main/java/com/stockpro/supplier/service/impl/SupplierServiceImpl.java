package com.stockpro.supplier.service.impl;

import com.stockpro.supplier.dto.SupplierRequestDTO;
import com.stockpro.supplier.dto.SupplierResponseDTO;
import com.stockpro.supplier.entity.Supplier;
import com.stockpro.supplier.exception.ResourceNotFoundException;
import com.stockpro.supplier.repository.SupplierRepository;
import com.stockpro.supplier.service.SupplierService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SupplierServiceImpl implements SupplierService {

    private final SupplierRepository supplierRepository;

    @Override
    public SupplierResponseDTO createSupplier(SupplierRequestDTO dto) {
        Supplier supplier = Supplier.builder()
                .name(dto.getName())
                .email(dto.getEmail())
                .phone(dto.getPhone())
                .contactPerson(dto.getContactPerson())
                .address(dto.getAddress())
                .city(dto.getCity())
                .country(dto.getCountry())
                .taxId(dto.getTaxId())
                .paymentTerms(dto.getPaymentTerms())
                .leadTimeDays(dto.getLeadTimeDays())
                .rating(dto.getRating())
                .build();
        return toDTO(supplierRepository.save(supplier));
    }

    @Override
    public List<SupplierResponseDTO> getAllSuppliers() {
        return supplierRepository.findAll().stream().map(this::toDTO).collect(Collectors.toList());
    }

    @Override
    public List<SupplierResponseDTO> getActiveSuppliers() {
        return supplierRepository.findByIsActive(true).stream().map(this::toDTO).collect(Collectors.toList());
    }

    @Override
    public SupplierResponseDTO getById(Long id) {
        return toDTO(supplierRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Supplier not found with id: " + id)));
    }

    @Override
    public SupplierResponseDTO updateSupplier(Long id, SupplierRequestDTO dto) {
        Supplier supplier = supplierRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Supplier not found with id: " + id));
        supplier.setName(dto.getName());
        supplier.setEmail(dto.getEmail());
        supplier.setPhone(dto.getPhone());
        supplier.setContactPerson(dto.getContactPerson());
        supplier.setAddress(dto.getAddress());
        supplier.setCity(dto.getCity());
        supplier.setCountry(dto.getCountry());
        supplier.setTaxId(dto.getTaxId());
        supplier.setPaymentTerms(dto.getPaymentTerms());
        supplier.setLeadTimeDays(dto.getLeadTimeDays());
        supplier.setRating(dto.getRating());
        return toDTO(supplierRepository.save(supplier));
    }

    @Override
    public void deactivateSupplier(Long id) {
        Supplier supplier = supplierRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Supplier not found with id: " + id));
        supplier.setActive(false);
        supplierRepository.save(supplier);
    }

    @Override
    public void deleteSupplier(Long id) {
        if (!supplierRepository.existsById(id)) {
            throw new ResourceNotFoundException("Supplier not found with id: " + id);
        }
        supplierRepository.deleteById(id);
    }

    @Override
    public List<SupplierResponseDTO> searchSuppliers(String name) {
        return supplierRepository.searchByName(name).stream().map(this::toDTO).collect(Collectors.toList());
    }

    @Override
    public List<SupplierResponseDTO> getByCity(String city) {
        return supplierRepository.findByCity(city).stream().map(this::toDTO).collect(Collectors.toList());
    }

    @Override
    public List<SupplierResponseDTO> getByCountry(String country) {
        return supplierRepository.findByCountry(country).stream().map(this::toDTO).collect(Collectors.toList());
    }

    @Override
    public SupplierResponseDTO updateRating(Long id, Double rating) {
        Supplier supplier = supplierRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Supplier not found with id: " + id));
        supplier.setRating(rating);
        return toDTO(supplierRepository.save(supplier));
    }

    private SupplierResponseDTO toDTO(Supplier s) {
        SupplierResponseDTO dto = new SupplierResponseDTO();
        dto.setSupplierId(s.getSupplierId());
        dto.setName(s.getName());
        dto.setEmail(s.getEmail());
        dto.setPhone(s.getPhone());
        dto.setContactPerson(s.getContactPerson());
        dto.setAddress(s.getAddress());
        dto.setCity(s.getCity());
        dto.setCountry(s.getCountry());
        dto.setTaxId(s.getTaxId());
        dto.setPaymentTerms(s.getPaymentTerms());
        dto.setLeadTimeDays(s.getLeadTimeDays());
        dto.setRating(s.getRating());
        dto.setActive(s.isActive());
        dto.setCreatedAt(s.getCreatedAt());
        dto.setUpdatedAt(s.getUpdatedAt());
        return dto;
    }
}
