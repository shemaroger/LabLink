package com.techquest.lablink.service;

import com.techquest.lablink.dto.request.ConsultationCreateRequest;
import com.techquest.lablink.dto.response.ConsultationResponse;
import com.techquest.lablink.enums.AuditAction;
import com.techquest.lablink.exception.ResourceNotFoundException;
import com.techquest.lablink.model.Consultation;
import com.techquest.lablink.model.Patient;
import com.techquest.lablink.model.User;
import com.techquest.lablink.repository.ConsultationRepository;
import com.techquest.lablink.repository.PatientRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ConsultationService {

    private final ConsultationRepository consultationRepository;
    private final PatientRepository patientRepository;
    private final AuditLogService auditLogService;

    public ConsultationService(ConsultationRepository consultationRepository,
                                PatientRepository patientRepository,
                                AuditLogService auditLogService) {
        this.consultationRepository = consultationRepository;
        this.patientRepository = patientRepository;
        this.auditLogService = auditLogService;
    }

    @Transactional
    public ConsultationResponse create(ConsultationCreateRequest request, User doctor) {
        Patient patient = patientRepository.findById(request.getPatient())
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found."));

        Consultation consultation = new Consultation();
        consultation.setPatient(patient);
        consultation.setDoctor(doctor);
        consultation.setChiefComplaint(request.getChiefComplaint());
        consultation.setHistoryOfIllness(request.getHistoryOfIllness());
        consultation.setPhysicalExamination(request.getPhysicalExamination());
        consultation.setDiagnosis(request.getDiagnosis());
        consultation.setDiagnosisType(request.getDiagnosisType());
        consultation.setTreatmentPlan(request.getTreatmentPlan());
        consultation.setPrescriptions(request.getPrescriptions());
        consultation.setLabTestsOrdered(request.getLabTestsOrdered());
        consultation.setFollowUpDate(request.getFollowUpDate());
        consultation.setNotes(request.getNotes());

        Consultation saved = consultationRepository.save(consultation);
        auditLogService.logAction(doctor, AuditAction.CREATE_CONSULTATION, "consultation", saved.getId().toString(),
                "Created consultation for patient " + patient.getId());

        return ConsultationResponse.from(saved);
    }

    @Transactional(readOnly = true)
    public List<ConsultationResponse> list(Long patientId) {
        return consultationRepository.findAll().stream()
                .filter(c -> patientId == null || c.getPatient().getId().equals(patientId))
                .map(ConsultationResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public ConsultationResponse getById(Long id) {
        return consultationRepository.findById(id)
                .map(ConsultationResponse::from)
                .orElseThrow(() -> new ResourceNotFoundException("Consultation not found."));
    }

    @Transactional(readOnly = true)
    public List<ConsultationResponse> forPatient(Long patientId) {
        return consultationRepository.findByPatientIdOrderByCreatedAtDesc(patientId).stream()
                .map(ConsultationResponse::from)
                .toList();
    }
}
