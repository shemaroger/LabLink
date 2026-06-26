package com.techquest.lablink.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PasswordResetRequestRequest {

    /** Either the user's email or their registered phone number. */
    @NotBlank
    private String identifier;
}
