package com.techquest.lablink.service;

import com.techquest.lablink.dto.request.TriageCreateRequest;
import com.techquest.lablink.dto.request.TriageUpdateRequest;
import com.techquest.lablink.dto.response.TriageResponse;
import com.techquest.lablink.enums.AuditAction;
import com.techquest.lablink.exception.ResourceNotFoundException;
import com.techquest.lablink.model.Patient;
import com.techquest.lablink.model.TriageRecord;
import com.techquest.lablink.model.User;
import com.techquest.lablink.repository.PatientRepository;
import com.techquest.lablink.repository.TriageRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class TriageService {

    private final TriageRepository triageRepository;
    private final PatientRepository patientRepository;
    private final AuditLogService auditLogService;

    public TriageService(TriageRepository triageRepository, PatientRepository patientRepository, AuditLogService auditLogService) {
        this.triageRepository = triageRepository;
        this.patientRepository = patientRepository;
        this.auditLogService = auditLogService;
    }

    @Transactional
    public TriageResponse create(TriageCreateRequest request, User nurse) {
        Patient patient = patientRepository.findById(request.getPatient())
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found."));

        TriageRecord record = new TriageRecord();
        record.setPatient(patient);
        record.setNurse(nurse);
        record.setTemperature(request.getTemperature());
        record.setBloodPressure(request.getBloodPressure());
        record.setPulseRate(request.getPulseRate());
        record.setRespiratoryRate(request.getRespiratoryRate());
        record.setWeight(request.getWeight());
        record.setHeight(request.getHeight());
        record.setChiefComplaint(request.getChiefComplaint());
        record.setSymptoms(request.getSymptoms());
        record.setUrgencyLevel(request.getUrgencyLevel());
        record.setNotes(request.getNotes());

        TriageRecord saved = triageRepository.save(record);
        auditLogService.logAction(nurse, AuditAction.CREATE_TRIAGE, "triage", saved.getId().toString(),
                "Created triage record (urgency: " + saved.getUrgencyLevel().getCode() + ") for patient " + patient.getId());

        return TriageResponse.from(saved);
    }

    @Transactional(readOnly = true)
    public List<TriageResponse> list(Long patientId, com.techquest.lablink.enums.UrgencyLevel urgency) {
        return triageRepository.findAll().stream()
                .filter(r -> patientId == null || r.getPatient().getId().equals(patientId))
                .filter(r -> urgency == null || r.getUrgencyLevel() == urgency)
                .map(TriageResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public TriageResponse getById(Long id) {
        return TriageResponse.from(getOrThrow(id));
    }

    @Transactional
    public TriageResponse update(Long id, TriageUpdateRequest request, User actingUser) {
        TriageRecord record = getOrThrow(id);
        if (request.getTemperature() != null) record.setTemperature(request.getTemperature());
        if (request.getBloodPressure() != null) record.setBloodPressure(request.getBloodPressure());
        if (request.getPulseRate() != null) record.setPulseRate(request.getPulseRate());
        if (request.getRespiratoryRate() != null) record.setRespiratoryRate(request.getRespiratoryRate());
        if (request.getWeight() != null) record.setWeight(request.getWeight());
        if (request.getHeight() != null) record.setHeight(request.getHeight());
        if (request.getChiefComplaint() != null) record.setChiefComplaint(request.getChiefComplaint());
        if (request.getSymptoms() != null) record.setSymptoms(request.getSymptoms());
        if (request.getUrgencyLevel() != null) record.setUrgencyLevel(request.getUrgencyLevel());
        if (request.getNotes() != null) record.setNotes(request.getNotes());

        return TriageResponse.from(triageRepository.save(record));
    }

    @Transactional(readOnly = true)
    public List<TriageResponse> forPatient(Long patientId) {
        return triageRepository.findByPatientIdOrderByCreatedAtDesc(patientId).stream()
                .map(TriageResponse::from)
                .toList();
    }

    private TriageRecord getOrThrow(Long id) {
        return triageRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Triage record not found."));
    }
}
