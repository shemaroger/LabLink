package com.techquest.lablink.dto.request;

import com.techquest.lablink.enums.DiagnosisType;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class ConsultationCreateRequest {

    @NotNull
    private Long patient;

    private String chiefComplaint;

    private String historyOfIllness;

    private String physicalExamination;

    private String diagnosis;

    private DiagnosisType diagnosisType;

    private String treatmentPlan;

    private String prescriptions;

    private String labTestsOrdered;

    private LocalDate followUpDate;

    private String notes;
}
