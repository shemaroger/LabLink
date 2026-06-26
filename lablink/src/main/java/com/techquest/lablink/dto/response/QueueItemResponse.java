package com.techquest.lablink.dto.response;

import com.techquest.lablink.enums.QueueStatus;
import com.techquest.lablink.model.Patient;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class QueueItemResponse {

    private Long id;
    private String fullName;
    private String email;
    private String phone;
    private Integer queueNumber;
    private QueueStatus queueStatus;
    private LocalDateTime queueEntryTime;
    private LocalDateTime createdAt;

    public static QueueItemResponse from(Patient patient) {
        QueueItemResponse response = new QueueItemResponse();
        response.setId(patient.getId());
        response.setFullName(patient.getUser().getFirstName() + " " + patient.getUser().getLastName());
        response.setEmail(patient.getUser().getEmail());
        response.setPhone(patient.getPhone());
        response.setQueueNumber(patient.getQueueNumber());
        response.setQueueStatus(patient.getQueueStatus());
        response.setQueueEntryTime(patient.getUpdatedAt());
        response.setCreatedAt(patient.getCreatedAt());
        return response;
    }
}
