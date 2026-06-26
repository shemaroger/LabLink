package com.techquest.lablink.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;

@Getter
public class MfaRequiredResponse {

    @JsonProperty("mfa_required")
    private final boolean mfaRequired = true;

    private final String email;

    public MfaRequiredResponse(String email) {
        this.email = email;
    }
}
