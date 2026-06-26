package com.techquest.lablink.controller;

import com.techquest.lablink.dto.request.ChangePasswordRequest;
import com.techquest.lablink.dto.request.UpdateProfileRequest;
import com.techquest.lablink.dto.request.UpdateUserRequest;
import com.techquest.lablink.dto.response.ApiResponse;
import com.techquest.lablink.dto.response.UserResponse;
import com.techquest.lablink.enums.Role;
import com.techquest.lablink.security.UserPrincipal;
import com.techquest.lablink.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/profile/")
    public ResponseEntity<UserResponse> getProfile(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(userService.getProfile(principal.getUsername()));
    }

    @PatchMapping("/profile/")
    public ResponseEntity<UserResponse> updateProfile(@AuthenticationPrincipal UserPrincipal principal,
                                                        @RequestBody UpdateProfileRequest request) {
        return ResponseEntity.ok(userService.updateProfile(principal.getUsername(), request));
    }

    @PostMapping("/change-password/")
    public ResponseEntity<ApiResponse> changePassword(@AuthenticationPrincipal UserPrincipal principal,
                                                        @Valid @RequestBody ChangePasswordRequest request) {
        userService.changePassword(principal.getUsername(), request);
        return ResponseEntity.ok(new ApiResponse("Password changed successfully."));
    }

    @GetMapping("/list/")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<UserResponse>> listUsers(@RequestParam(required = false) Role role) {
        return ResponseEntity.ok(userService.listUsers(role));
    }

    @GetMapping("/{id}/")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserResponse> getUser(@PathVariable Long id) {
        return ResponseEntity.ok(userService.getUser(id));
    }

    @PatchMapping("/{id}/")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserResponse> updateUser(@AuthenticationPrincipal UserPrincipal principal,
                                                     @PathVariable Long id, @RequestBody UpdateUserRequest request) {
        return ResponseEntity.ok(userService.updateUser(id, request, principal.getUser()));
    }
}
