package com.techquest.lablink.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.techquest.lablink.enums.DeliveryMethod;
import com.techquest.lablink.enums.NotificationStatus;
import com.techquest.lablink.model.Notification;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class NotificationResponse {

    private Long id;
    private PatientSummary patient;
    private String title;
    private String message;
    private DeliveryMethod deliveryMethod;
    private NotificationStatus status;

    @JsonProperty("is_read")
    private boolean read;
    private LocalDateTime sentAt;
    private LocalDateTime readAt;
    private LocalDateTime createdAt;

    public static NotificationResponse from(Notification notification) {
        NotificationResponse response = new NotificationResponse();
        response.setId(notification.getId());
        response.setPatient(PatientSummary.from(notification.getPatient()));
        response.setTitle(notification.getTitle());
        response.setMessage(notification.getMessage());
        response.setDeliveryMethod(notification.getDeliveryMethod());
        response.setStatus(notification.getStatus());
        response.setRead(notification.getStatus() == NotificationStatus.READ);
        response.setSentAt(notification.getSentAt());
        response.setReadAt(notification.getReadAt());
        response.setCreatedAt(notification.getCreatedAt());
        return response;
    }
}
