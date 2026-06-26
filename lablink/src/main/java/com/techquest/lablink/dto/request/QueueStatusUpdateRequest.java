package com.techquest.lablink.dto.request;

import com.techquest.lablink.enums.QueueStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class QueueStatusUpdateRequest {

    @NotNull
    private QueueStatus queueStatus;
}
