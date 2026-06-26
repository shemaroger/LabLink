package com.techquest.lablink.dto.request;

import com.techquest.lablink.enums.DeliveryMethod;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class SendNotificationRequest {

    @NotNull
    private Long patient;

    @NotBlank
    private String title;

    @NotBlank
    private String message;

    private DeliveryMethod deliveryMethod = DeliveryMethod.IN_APP;
}
