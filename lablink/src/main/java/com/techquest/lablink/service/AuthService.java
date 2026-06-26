package com.techquest.lablink.service;

import com.techquest.lablink.dto.request.AdminCreateUserRequest;
import com.techquest.lablink.dto.request.LoginRequest;
import com.techquest.lablink.dto.request.MfaVerifyRequest;
import com.techquest.lablink.dto.request.PasswordResetConfirmRequest;
import com.techquest.lablink.dto.request.RegisterRequest;
import com.techquest.lablink.dto.response.AccessTokenResponse;
import com.techquest.lablink.dto.response.AuthResponse;
import com.techquest.lablink.dto.response.MfaRequiredResponse;
import com.techquest.lablink.dto.response.TokenPairResponse;
import com.techquest.lablink.dto.response.UserResponse;
import com.techquest.lablink.enums.AuditAction;
import com.techquest.lablink.enums.Role;
import com.techquest.lablink.exception.ConflictException;
import com.techquest.lablink.exception.ResourceNotFoundException;
import com.techquest.lablink.exception.UnauthorizedException;
import com.techquest.lablink.model.Patient;
import com.techquest.lablink.model.RefreshToken;
import com.techquest.lablink.model.User;
import com.techquest.lablink.repository.PatientRepository;
import com.techquest.lablink.repository.RefreshTokenRepository;
import com.techquest.lablink.repository.UserRepository;
import com.techquest.lablink.security.JwtTokenProvider;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.Instant;
import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Service
public class AuthService {

    private static final String ALLOWED_PASSWORD_CHARS =
            "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%";
    private static final int MFA_CODE_EXPIRY_MINUTES = 10;
    private static final int PASSWORD_RESET_EXPIRY_MINUTES = 15;
    private static final int EMAIL_VERIFICATION_EXPIRY_HOURS = 24;

    private final UserRepository userRepository;
    private final PatientRepository patientRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider jwtTokenProvider;
    private final EmailService emailService;
    private final SmsService smsService;
    private final AuditLogService auditLogService;
    private final String frontendUrl;
    private final SecureRandom secureRandom = new SecureRandom();

    public AuthService(UserRepository userRepository,
                        PatientRepository patientRepository,
                        RefreshTokenRepository refreshTokenRepository,
                        PasswordEncoder passwordEncoder,
                        AuthenticationManager authenticationManager,
                        JwtTokenProvider jwtTokenProvider,
                        EmailService emailService,
                        SmsService smsService,
                        AuditLogService auditLogService,
                        @Value("${app.frontend.url}") String frontendUrl) {
        this.userRepository = userRepository;
        this.patientRepository = patientRepository;
        this.refreshTokenRepository = refreshTokenRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtTokenProvider = jwtTokenProvider;
        this.emailService = emailService;
        this.smsService = smsService;
        this.auditLogService = auditLogService;
        this.frontendUrl = frontendUrl;
    }

    @Transactional
    public UserResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new ConflictException("A user with this email already exists.");
        }
        User user = new User();
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setRole(Role.PATIENT);
        user.setEmailVerified(false);
        User saved = userRepository.save(user);
        issueEmailVerification(saved);
        auditLogService.logAction(saved, AuditAction.REGISTER, "user", saved.getId().toString(),
                "User registered: " + saved.getEmail());
        return UserResponse.from(saved);
    }

    @Transactional
    public UserResponse adminCreateUser(AdminCreateUserRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new ConflictException("A user with this email already exists.");
        }
        String temporaryPassword = generateTemporaryPassword();

        User user = new User();
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(temporaryPassword));
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setPhone(request.getPhone());
        user.setRole(request.getRole());
        user.setMustChangePassword(true);
        user.setEmailVerified(false);
        User saved = userRepository.save(user);

        emailService.sendWelcomeEmail(saved.getEmail(), saved.getFirstName(), temporaryPassword);
        issueEmailVerification(saved);

        return UserResponse.from(saved);
    }

    @Transactional
    public Object login(LoginRequest request) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword()));
        } catch (Exception e) {
            throw new UnauthorizedException("Invalid email or password.");
        }

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new UnauthorizedException("Invalid email or password."));

        if (user.isMfaEnabled()) {
            String code = generateOtpCode();
            user.setMfaCode(code);
            user.setMfaCodeExpiresAt(LocalDateTime.now().plusMinutes(MFA_CODE_EXPIRY_MINUTES));
            userRepository.save(user);
            emailService.sendNotificationEmail(user.getEmail(), "Your LabLink verification code",
                    "Your one-time verification code is: " + code + "\nIt expires in "
                            + MFA_CODE_EXPIRY_MINUTES + " minutes.");
            return new MfaRequiredResponse(user.getEmail());
        }

        TokenPairResponse tokens = issueTokens(user);
        auditLogService.logAction(user, AuditAction.LOGIN, "user", user.getId().toString(),
                "User logged in: " + user.getEmail());
        return new AuthResponse(tokens, UserResponse.from(user));
    }

    @Transactional
    public AuthResponse verifyMfaLogin(MfaVerifyRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new UnauthorizedException("Invalid or expired verification code."));

        if (user.getMfaCode() == null
                || !user.getMfaCode().equals(request.getCode())
                || user.getMfaCodeExpiresAt() == null
                || user.getMfaCodeExpiresAt().isBefore(LocalDateTime.now())) {
            throw new UnauthorizedException("Invalid or expired verification code.");
        }

        user.setMfaCode(null);
        user.setMfaCodeExpiresAt(null);
        userRepository.save(user);

        TokenPairResponse tokens = issueTokens(user);
        auditLogService.logAction(user, AuditAction.LOGIN, "user", user.getId().toString(),
                "User logged in (MFA verified): " + user.getEmail());
        return new AuthResponse(tokens, UserResponse.from(user));
    }

    @Transactional
    public UserResponse setMfaEnabled(User currentUser, boolean enabled) {
        User user = userRepository.findById(currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found."));
        if (enabled && (user.getEmail() == null || user.getEmail().isBlank())) {
            throw new ConflictException("An email address is required to enable two-factor authentication.");
        }
        user.setMfaEnabled(enabled);
        User saved = userRepository.save(user);
        auditLogService.logAction(user, enabled ? AuditAction.MFA_ENABLED : AuditAction.MFA_DISABLED,
                "user", user.getId().toString(),
                (enabled ? "Enabled" : "Disabled") + " two-factor authentication.");
        return UserResponse.from(saved);
    }

    @Transactional
    public void requestPasswordReset(String identifier) {
        Optional<User> userOpt = resolveUserByIdentifier(identifier);
        if (userOpt.isEmpty()) {
            return; // don't reveal whether an account exists for this identifier
        }
        User user = userOpt.get();
        String code = generateOtpCode();
        user.setPasswordResetCode(code);
        user.setPasswordResetExpiresAt(LocalDateTime.now().plusMinutes(PASSWORD_RESET_EXPIRY_MINUTES));
        userRepository.save(user);

        String message = "Your LabLink password reset code is: " + code + "\nIt expires in "
                + PASSWORD_RESET_EXPIRY_MINUTES + " minutes. If you didn't request this, you can ignore it.";

        if (user.getEmail() != null && !user.getEmail().isBlank()) {
            emailService.sendNotificationEmail(user.getEmail(), "LabLink password reset code", message);
        } else {
            patientRepository.findByUserId(user.getId())
                    .filter(p -> p.getPhone() != null && !p.getPhone().isBlank())
                    .ifPresent(p -> smsService.sendSms(p.getPhone(), message));
        }

        auditLogService.logAction(user, AuditAction.PASSWORD_RESET_REQUESTED, "user", user.getId().toString(),
                "Password reset requested.");
    }

    @Transactional
    public void confirmPasswordReset(PasswordResetConfirmRequest request) {
        User user = resolveUserByIdentifier(request.getIdentifier())
                .orElseThrow(() -> new UnauthorizedException("Invalid or expired reset code."));

        if (user.getPasswordResetCode() == null
                || !user.getPasswordResetCode().equals(request.getCode())
                || user.getPasswordResetExpiresAt() == null
                || user.getPasswordResetExpiresAt().isBefore(LocalDateTime.now())) {
            throw new UnauthorizedException("Invalid or expired reset code.");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        user.setPasswordResetCode(null);
        user.setPasswordResetExpiresAt(null);
        user.setMustChangePassword(false);
        userRepository.save(user);

        refreshTokenRepository.findByUserIdAndRevokedFalse(user.getId())
                .forEach(token -> token.setRevoked(true));

        auditLogService.logAction(user, AuditAction.PASSWORD_RESET_COMPLETED, "user", user.getId().toString(),
                "Password reset completed.");
    }

    @Transactional
    public void verifyEmail(String token) {
        User user = userRepository.findByEmailVerificationToken(token)
                .orElseThrow(() -> new UnauthorizedException("Invalid or expired verification link."));

        if (user.getEmailVerificationExpiresAt() == null
                || user.getEmailVerificationExpiresAt().isBefore(LocalDateTime.now())) {
            throw new UnauthorizedException("Invalid or expired verification link.");
        }

        user.setEmailVerified(true);
        user.setEmailVerificationToken(null);
        user.setEmailVerificationExpiresAt(null);
        userRepository.save(user);

        auditLogService.logAction(user, AuditAction.EMAIL_VERIFIED, "user", user.getId().toString(),
                "Email verified.");
    }

    @Transactional
    public void resendVerificationEmail(User currentUser) {
        User user = userRepository.findById(currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found."));
        if (user.isEmailVerified()) {
            throw new ConflictException("Email is already verified.");
        }
        if (user.getEmail() == null || user.getEmail().isBlank()) {
            throw new ConflictException("No email address on file to verify.");
        }
        issueEmailVerification(user);
    }

    @Transactional
    public AccessTokenResponse refresh(String refreshToken) {
        Claims claims;
        try {
            claims = jwtTokenProvider.parseClaims(refreshToken);
        } catch (JwtException | IllegalArgumentException e) {
            throw new UnauthorizedException("Invalid or expired refresh token.");
        }
        if (!jwtTokenProvider.isRefreshToken(claims)) {
            throw new UnauthorizedException("Invalid or expired refresh token.");
        }

        String tokenId = jwtTokenProvider.getTokenId(claims);
        RefreshToken stored = refreshTokenRepository.findByTokenId(tokenId)
                .orElseThrow(() -> new UnauthorizedException("Invalid or expired refresh token."));

        if (stored.isRevoked() || stored.getExpiryDate().isBefore(Instant.now())) {
            throw new UnauthorizedException("Invalid or expired refresh token.");
        }

        String accessToken = jwtTokenProvider.generateAccessToken(stored.getUser().getEmail());
        return new AccessTokenResponse(accessToken);
    }

    @Transactional
    public void logout(String refreshToken) {
        try {
            Claims claims = jwtTokenProvider.parseClaims(refreshToken);
            String tokenId = jwtTokenProvider.getTokenId(claims);
            refreshTokenRepository.findByTokenId(tokenId).ifPresent(stored -> {
                stored.setRevoked(true);
                refreshTokenRepository.save(stored);
                auditLogService.logAction(stored.getUser(), AuditAction.LOGOUT, "user", stored.getUser().getId().toString(),
                        "User logged out: " + stored.getUser().getEmail());
            });
        } catch (JwtException | IllegalArgumentException ignored) {
            // already invalid/expired: nothing to revoke
        }
    }

    /** Generates and emails a fresh verification link, overwriting any previous one. */
    public void issueEmailVerification(User user) {
        String token = UUID.randomUUID().toString();
        user.setEmailVerificationToken(token);
        user.setEmailVerificationExpiresAt(LocalDateTime.now().plusHours(EMAIL_VERIFICATION_EXPIRY_HOURS));
        userRepository.save(user);

        String link = frontendUrl + "/verify-email?token=" + token;
        emailService.sendNotificationEmail(user.getEmail(), "Verify your LabLink email address",
                "Please verify your email address by clicking the link below:\n" + link
                        + "\n\nThis link expires in " + EMAIL_VERIFICATION_EXPIRY_HOURS + " hours.");
    }

    private Optional<User> resolveUserByIdentifier(String identifier) {
        Optional<User> byEmail = userRepository.findByEmail(identifier);
        if (byEmail.isPresent()) {
            return byEmail;
        }
        return patientRepository.findByPhone(identifier).map(Patient::getUser);
    }

    private TokenPairResponse issueTokens(User user) {
        String accessToken = jwtTokenProvider.generateAccessToken(user.getEmail());
        String tokenId = jwtTokenProvider.newTokenId();
        String refreshToken = jwtTokenProvider.generateRefreshToken(user.getEmail(), tokenId);

        RefreshToken entity = new RefreshToken();
        entity.setTokenId(tokenId);
        entity.setUser(user);
        entity.setExpiryDate(jwtTokenProvider.refreshTokenExpiryDate().toInstant());
        refreshTokenRepository.save(entity);

        return new TokenPairResponse(accessToken, refreshToken);
    }

    private String generateTemporaryPassword() {
        StringBuilder sb = new StringBuilder(12);
        for (int i = 0; i < 12; i++) {
            sb.append(ALLOWED_PASSWORD_CHARS.charAt(secureRandom.nextInt(ALLOWED_PASSWORD_CHARS.length())));
        }
        return sb.toString();
    }

    private String generateOtpCode() {
        return String.format("%06d", secureRandom.nextInt(1_000_000));
    }
}
