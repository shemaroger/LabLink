package com.techquest.lablink.dto.response;

import com.techquest.lablink.enums.QueueStatus;
import com.techquest.lablink.model.Patient;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
public class PatientResponse {

    private Long id;
    private String fullName;
    private String firstName;
    private String lastName;
    private String email;
    private String phone;
    private LocalDate dateOfBirth;
    private String gender;
    private String bloodGroup;
    private String address;
    private String allergies;
    private String emergencyContactName;
    private String emergencyContactPhone;
    private String insuranceProvider;
    private String insuranceCardNumber;
    private Integer queueNumber;
    private QueueStatus queueStatus;
    private Long peopleAhead;
    private LocalDateTime createdAt;

    public static PatientResponse from(Patient patient) {
        PatientResponse response = new PatientResponse();
        response.setId(patient.getId());
        response.setFirstName(patient.getUser().getFirstName());
        response.setLastName(patient.getUser().getLastName());
        response.setFullName(patient.getUser().getFirstName() + " " + patient.getUser().getLastName());
        response.setEmail(patient.getUser().getEmail());
        response.setPhone(patient.getPhone());
        response.setDateOfBirth(patient.getDateOfBirth());
        response.setGender(patient.getGender());
        response.setBloodGroup(patient.getBloodGroup());
        response.setAddress(patient.getAddress());
        response.setAllergies(patient.getAllergies());
        response.setEmergencyContactName(patient.getEmergencyContactName());
        response.setEmergencyContactPhone(patient.getEmergencyContactPhone());
        response.setInsuranceProvider(patient.getInsuranceProvider());
        response.setInsuranceCardNumber(patient.getInsuranceCardNumber());
        response.setQueueNumber(patient.isQueuedToday() ? patient.getQueueNumber() : null);
        response.setQueueStatus(patient.isQueuedToday() ? patient.getQueueStatus() : null);
        response.setCreatedAt(patient.getCreatedAt());
        return response;
    }
}
