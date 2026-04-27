package com.stockpro.auth.service;

import com.stockpro.auth.entity.User;
import com.stockpro.auth.dto.AuthResponseDTO;
import java.util.List;

public interface AuthService {

    User register(User user);

    AuthResponseDTO login(String email, String password);

    void logout(String token);

    boolean validateToken(String token);

    String refreshToken(String token);

    User getUserById(Long id);

    User getUserByEmail(String email);

    User updateProfile(Long id, User user);

    void changePassword(Long id, String newPassword);

    void deactivateUser(Long id);

    List<User> getAllUsers();
}