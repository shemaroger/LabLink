package com.techquest.lablink.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.techquest.lablink.enums.Role;
import com.techquest.lablink.model.User;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class UserResponse {

    private Long id;
    private String firstName;
    private String lastName;
    private String email;
    private String phone;
    private Role role;

    @JsonProperty("is_active")
    private boolean active;

    private boolean mustChangePassword;

    @JsonProperty("mfa_enabled")
    private boolean mfaEnabled;

    @JsonProperty("email_verified")
    private boolean emailVerified;

    private LocalDateTime createdAt;

    public static UserResponse from(User user) {
        UserResponse response = new UserResponse();
        response.setId(user.getId());
        response.setFirstName(user.getFirstName());
        response.setLastName(user.getLastName());
        response.setEmail(user.getEmail());
        response.setPhone(user.getPhone());
        response.setRole(user.getRole());
        response.setActive(user.isActive());
        response.setMustChangePassword(user.isMustChangePassword());
        response.setMfaEnabled(user.isMfaEnabled());
        response.setEmailVerified(user.isEmailVerified());
        response.setCreatedAt(user.getCreatedAt());
        return response;
    }
}
