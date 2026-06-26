package com.techquest.lablink.dto.response;

import com.techquest.lablink.model.Patient;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PatientSummary {

    private Long id;
    private String fullName;

    public static PatientSummary from(Patient patient) {
        PatientSummary summary = new PatientSummary();
        summary.setId(patient.getId());
        summary.setFullName(patient.getUser().getFirstName() + " " + patient.getUser().getLastName());
        return summary;
    }
}
