package com.techquest.lablink.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class MfaToggleRequest {

    @NotNull
    private Boolean enabled;
}
