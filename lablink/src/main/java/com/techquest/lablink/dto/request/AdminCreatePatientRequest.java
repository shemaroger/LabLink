package com.techquest.lablink.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class AdminCreatePatientRequest {

    @NotBlank
    private String firstName;

    @NotBlank
    private String lastName;

    @Email
    private String email;

    @NotBlank
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
