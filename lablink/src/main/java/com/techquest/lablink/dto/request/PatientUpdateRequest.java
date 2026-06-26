package com.techquest.lablink.dto.request;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class PatientUpdateRequest {

    private String firstName;

    private String lastName;

    private String phone;

    private LocalDate dateOfBirth;

    private String gender;

    private String address;

    private String bloodGroup;

    private String allergies;

    private String emergencyContactName;

    private String emergencyContactPhone;

    private String insuranceProvider;

    private String insuranceCardNumber;
}
