package com.techquest.lablink.dto.request;

import com.techquest.lablink.enums.ResultStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class LabResultStatusUpdateRequest {

    @NotNull
    private ResultStatus status;
}
