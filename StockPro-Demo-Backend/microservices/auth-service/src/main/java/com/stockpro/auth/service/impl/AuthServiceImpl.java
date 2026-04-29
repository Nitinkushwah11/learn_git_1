package com.stockpro.auth.service.impl;

import com.stockpro.auth.entity.User;
import com.stockpro.auth.dto.AuthResponseDTO;
import com.stockpro.auth.exception.UserAlreadyExistsException;
import com.stockpro.auth.repository.UserRepository;
import com.stockpro.auth.service.AuthService;
import com.stockpro.auth.util.JwtUtil;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class AuthServiceImpl implements AuthService {

    @Autowired
    private UserRepository repo;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    @Override
    public User register(User user) {
    	// 1. MUST check for duplicate email before saving!
        if (repo.existsByEmail(user.getEmail())) {
            throw new UserAlreadyExistsException("A user with the email " + user.getEmail() + " is already registered.");
        }

        // 2. Proceed with encoding and saving
        user.setPasswordHash(passwordEncoder.encode(user.getPasswordHash()));
        
        // Only set default role if not provided (allows Admin to specify roles)
        if (user.getRole() == null || user.getRole().trim().isEmpty()) {
            user.setRole("STAFF");
        }
        
        // Only set default department if not provided
        if (user.getDepartment() == null || user.getDepartment().trim().isEmpty()) {
            user.setDepartment("General");
        }
        
        user.setCreatedAt(LocalDateTime.now());
        return repo.save(user);
    }

    @Override
    public AuthResponseDTO login(String email, String password) {
        User user = repo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!passwordEncoder.matches(password, user.getPasswordHash())) {
            throw new RuntimeException("Invalid credentials");
        }

        user.setLastLoginAt(LocalDateTime.now());
        repo.save(user);

        String token = jwtUtil.generateToken(user.getEmail(), user.getRole());
        return AuthResponseDTO.builder()
                .token(token)
                .userId(user.getUserId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .role(user.getRole())
                .build();
    }

    @Override
    public void logout(String token) {}

    @Override
    public boolean validateToken(String token) {
        return jwtUtil.validateToken(token);
    }

    @Override
    public String refreshToken(String token) {
        return jwtUtil.generateToken(jwtUtil.extractEmail(token), "USER");
    }

    @Override
    public User getUserById(Long id) {
        return repo.findById(id).orElseThrow();
    }

    @Override
    public User getUserByEmail(String email) {
        return repo.findByEmail(email).orElseThrow();
    }

    @Override
    public User updateProfile(Long id, User updatedUser) {
        User user = getUserById(id);
        user.setFullName(updatedUser.getFullName());
        user.setPhone(updatedUser.getPhone());
        user.setDepartment(updatedUser.getDepartment());
        return repo.save(user);
    }

    @Override
    public void changePassword(Long id, String newPassword) {
        User user = getUserById(id);
        user.setPasswordHash(passwordEncoder.encode(newPassword));
        repo.save(user);
    }

    @Override
    public void deactivateUser(Long id) {
        User user = getUserById(id);
        user.setActive(false);
        repo.save(user);
    }

    @Override
    public void deleteUser(Long id) {
        if (!repo.existsById(id)) {
            throw new RuntimeException("User not found with id: " + id);
        }
        repo.deleteById(id);
    }

    @Override
    public List<User> getAllUsers() {
        return repo.findAll();
    }
}