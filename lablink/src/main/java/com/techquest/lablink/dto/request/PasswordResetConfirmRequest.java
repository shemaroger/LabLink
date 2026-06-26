package com.techquest.lablink.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PasswordResetConfirmRequest {

    @NotBlank
    private String identifier;

    @NotBlank
    private String code;

    @NotBlank
    @Size(min = 8)
    private String newPassword;
}
