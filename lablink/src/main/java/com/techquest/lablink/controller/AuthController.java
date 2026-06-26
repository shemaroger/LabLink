package com.techquest.lablink.controller;

import com.techquest.lablink.dto.request.AdminCreateUserRequest;
import com.techquest.lablink.dto.request.LoginRequest;
import com.techquest.lablink.dto.request.MfaToggleRequest;
import com.techquest.lablink.dto.request.MfaVerifyRequest;
import com.techquest.lablink.dto.request.PasswordResetConfirmRequest;
import com.techquest.lablink.dto.request.PasswordResetRequestRequest;
import com.techquest.lablink.dto.request.RefreshTokenRequest;
import com.techquest.lablink.dto.request.RegisterRequest;
import com.techquest.lablink.dto.response.AccessTokenResponse;
import com.techquest.lablink.dto.response.ApiResponse;
import com.techquest.lablink.dto.response.AuthResponse;
import com.techquest.lablink.dto.response.UserResponse;
import com.techquest.lablink.security.UserPrincipal;
import com.techquest.lablink.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register/")
    public ResponseEntity<UserResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(authService.register(request));
    }

    @PostMapping("/admin-create/")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserResponse> adminCreate(@Valid @RequestBody AdminCreateUserRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(authService.adminCreateUser(request));
    }

    @PostMapping("/login/")
    public ResponseEntity<Object> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("/mfa/verify-login/")
    public ResponseEntity<AuthResponse> verifyMfaLogin(@Valid @RequestBody MfaVerifyRequest request) {
        return ResponseEntity.ok(authService.verifyMfaLogin(request));
    }

    @PatchMapping("/mfa/")
    public ResponseEntity<UserResponse> setMfaEnabled(@AuthenticationPrincipal UserPrincipal principal,
                                                         @Valid @RequestBody MfaToggleRequest request) {
        return ResponseEntity.ok(authService.setMfaEnabled(principal.getUser(), request.getEnabled()));
    }

    @PostMapping("/password-reset/request/")
    public ResponseEntity<ApiResponse> requestPasswordReset(@Valid @RequestBody PasswordResetRequestRequest request) {
        authService.requestPasswordReset(request.getIdentifier());
        return ResponseEntity.ok(new ApiResponse(
                "If an account exists for that email or phone number, a reset code has been sent."));
    }

    @PostMapping("/password-reset/confirm/")
    public ResponseEntity<ApiResponse> confirmPasswordReset(@Valid @RequestBody PasswordResetConfirmRequest request) {
        authService.confirmPasswordReset(request);
        return ResponseEntity.ok(new ApiResponse("Password reset successfully. Please log in."));
    }

    @GetMapping("/verify-email/")
    public ResponseEntity<ApiResponse> verifyEmail(@RequestParam String token) {
        authService.verifyEmail(token);
        return ResponseEntity.ok(new ApiResponse("Email verified successfully."));
    }

    @PostMapping("/resend-verification/")
    public ResponseEntity<ApiResponse> resendVerification(@AuthenticationPrincipal UserPrincipal principal) {
        authService.resendVerificationEmail(principal.getUser());
        return ResponseEntity.ok(new ApiResponse("Verification email sent."));
    }

    @PostMapping("/logout/")
    public ResponseEntity<ApiResponse> logout(@Valid @RequestBody RefreshTokenRequest request) {
        authService.logout(request.getRefresh());
        return ResponseEntity.ok(new ApiResponse("Successfully logged out."));
    }

    @PostMapping("/token/refresh/")
    public ResponseEntity<AccessTokenResponse> refresh(@Valid @RequestBody RefreshTokenRequest request) {
        return ResponseEntity.ok(authService.refresh(request.getRefresh()));
    }
}
