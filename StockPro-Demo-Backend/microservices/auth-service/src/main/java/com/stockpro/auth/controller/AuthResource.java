package com.stockpro.auth.controller;

import com.stockpro.auth.dto.LoginRequestDTO;
import com.stockpro.auth.dto.RegisterRequestDTO;
import com.stockpro.auth.dto.AuthResponseDTO;
import com.stockpro.auth.entity.User;
import com.stockpro.auth.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/auth")
@Tag(name = "Authentication API", description = "Endpoints for user registration, login, and user management")
public class AuthResource {

    @Autowired
    private AuthService service;

    @PostMapping("/register")
    @Operation(summary = "Register a new user to the StockPro platform")
    public ResponseEntity<User> register(@Valid @RequestBody RegisterRequestDTO dto) {
        // Map the validated DTO to the User Entity
        User user = new User();
        user.setFullName(dto.getFullName());
        user.setEmail(dto.getEmail());
        user.setPasswordHash(dto.getPassword()); // Notice we map 'password' to 'passwordHash'
        user.setPhone(dto.getPhone());
        user.setRole(dto.getRole());
        user.setDepartment(dto.getDepartment());

        User savedUser = service.register(user);
        return new ResponseEntity<>(savedUser, HttpStatus.CREATED); // 201 Created is best practice for registration
    }

    @PostMapping("/login")
    @Operation(summary = "Authenticate a user and generate a JWT token")
    public ResponseEntity<AuthResponseDTO> login(@Valid @RequestBody LoginRequestDTO req) {
        return ResponseEntity.ok(
                service.login(req.getEmail(), req.getPassword())
        );
    }

    @GetMapping("/users")
    @Operation(summary = "Get a list of all registered users")
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(service.getAllUsers());
    }

    @PutMapping("/profile/{id}")
    @Operation(summary = "Update user profile information")
    public ResponseEntity<User> updateProfile(@PathVariable Long id, @RequestBody User user) {
        return ResponseEntity.ok(service.updateProfile(id, user));
    }

    @PutMapping("/password/{id}")
    @Operation(summary = "Change user password")
    public ResponseEntity<Void> changePassword(@PathVariable Long id, @RequestBody java.util.Map<String, String> payload) {
        service.changePassword(id, payload.get("password"));
        return ResponseEntity.ok().build();
    }

    @PutMapping("/deactivate/{id}")
    @Operation(summary = "Deactivate a user account")
    public ResponseEntity<Void> deactivateUser(@PathVariable Long id) {
        service.deactivateUser(id);
        return ResponseEntity.ok().build();
    }
}