package com.techquest.lablink.dto.response;

import com.techquest.lablink.enums.DiagnosisType;
import com.techquest.lablink.model.Consultation;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
public class ConsultationResponse {

    private Long id;
    private PatientSummary patient;
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
    private LocalDateTime createdAt;

    public static ConsultationResponse from(Consultation consultation) {
        ConsultationResponse response = new ConsultationResponse();
        response.setId(consultation.getId());
        response.setPatient(PatientSummary.from(consultation.getPatient()));
        response.setChiefComplaint(consultation.getChiefComplaint());
        response.setHistoryOfIllness(consultation.getHistoryOfIllness());
        response.setPhysicalExamination(consultation.getPhysicalExamination());
        response.setDiagnosis(consultation.getDiagnosis());
        response.setDiagnosisType(consultation.getDiagnosisType());
        response.setTreatmentPlan(consultation.getTreatmentPlan());
        response.setPrescriptions(consultation.getPrescriptions());
        response.setLabTestsOrdered(consultation.getLabTestsOrdered());
        response.setFollowUpDate(consultation.getFollowUpDate());
        response.setNotes(consultation.getNotes());
        response.setCreatedAt(consultation.getCreatedAt());
        return response;
    }
}
