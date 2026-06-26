package com.techquest.lablink.service;

import com.techquest.lablink.dto.request.ChangePasswordRequest;
import com.techquest.lablink.dto.request.UpdateProfileRequest;
import com.techquest.lablink.dto.request.UpdateUserRequest;
import com.techquest.lablink.dto.response.UserResponse;
import com.techquest.lablink.enums.AuditAction;
import com.techquest.lablink.enums.Role;
import com.techquest.lablink.exception.ConflictException;
import com.techquest.lablink.exception.ResourceNotFoundException;
import com.techquest.lablink.exception.UnauthorizedException;
import com.techquest.lablink.model.User;
import com.techquest.lablink.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuditLogService auditLogService;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder, AuditLogService auditLogService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.auditLogService = auditLogService;
    }

    public UserResponse getProfile(String email) {
        return UserResponse.from(getUserByEmail(email));
    }

    @Transactional
    public UserResponse updateProfile(String email, UpdateProfileRequest request) {
        User user = getUserByEmail(email);
        if (request.getFirstName() != null) {
            user.setFirstName(request.getFirstName());
        }
        if (request.getLastName() != null) {
            user.setLastName(request.getLastName());
        }
        if (request.getPhone() != null) {
            user.setPhone(request.getPhone());
        }
        User saved = userRepository.save(user);
        auditLogService.logAction(saved, AuditAction.UPDATE_PROFILE, "user", saved.getId().toString(),
                "Updated own profile.");
        return UserResponse.from(saved);
    }

    @Transactional
    public void changePassword(String email, ChangePasswordRequest request) {
        User user = getUserByEmail(email);
        if (!passwordEncoder.matches(request.getOldPassword(), user.getPassword())) {
            throw new UnauthorizedException("Old password is incorrect.");
        }
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        user.setMustChangePassword(false);
        userRepository.save(user);
        auditLogService.logAction(user, AuditAction.CHANGE_PASSWORD, "user", user.getId().toString(),
                "Changed own password.");
    }

    public List<UserResponse> listUsers(Role roleFilter) {
        List<User> users = roleFilter != null ? userRepository.findByRole(roleFilter) : userRepository.findAll();
        return users.stream().map(UserResponse::from).toList();
    }

    public UserResponse getUser(Long id) {
        return UserResponse.from(getUserById(id));
    }

    @Transactional
    public UserResponse updateUser(Long id, UpdateUserRequest request, User actingUser) {
        User user = getUserById(id);
        Boolean activeChange = request.getIsActive();
        boolean activeChanged = activeChange != null && activeChange != user.isActive();

        if (request.getFirstName() != null) {
            user.setFirstName(request.getFirstName());
        }
        if (request.getLastName() != null) {
            user.setLastName(request.getLastName());
        }
        if (request.getPhone() != null) {
            user.setPhone(request.getPhone());
        }
        if (request.getRole() != null) {
            user.setRole(request.getRole());
        }
        if (request.getEmail() != null && !request.getEmail().equalsIgnoreCase(user.getEmail())) {
            if (userRepository.existsByEmail(request.getEmail())) {
                throw new ConflictException("A user with this email already exists.");
            }
            user.setEmail(request.getEmail());
        }
        if (activeChange != null) {
            user.setActive(activeChange);
        }

        User saved = userRepository.save(user);

        if (activeChanged) {
            auditLogService.logAction(actingUser, AuditAction.UPDATE_USER, "user", saved.getId().toString(),
                    (saved.isActive() ? "Activated" : "Deactivated") + " user " + saved.getEmail());
        } else {
            auditLogService.logAction(actingUser, AuditAction.UPDATE_USER, "user", saved.getId().toString(),
                    "Updated user " + saved.getEmail());
        }
        return UserResponse.from(saved);
    }

    private User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found."));
    }

    private User getUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found."));
    }
}
