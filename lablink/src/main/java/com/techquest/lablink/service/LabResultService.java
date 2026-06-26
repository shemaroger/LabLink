package com.techquest.lablink.service;

import com.techquest.lablink.dto.request.LabResultCreateRequest;
import com.techquest.lablink.dto.request.LabResultStatusUpdateRequest;
import com.techquest.lablink.dto.request.LabResultUpdateRequest;
import com.techquest.lablink.dto.response.LabResultResponse;
import com.techquest.lablink.enums.AuditAction;
import com.techquest.lablink.enums.ResultStatus;
import com.techquest.lablink.enums.Role;
import com.techquest.lablink.exception.ResourceNotFoundException;
import com.techquest.lablink.model.LabResult;
import com.techquest.lablink.model.Patient;
import com.techquest.lablink.model.User;
import com.techquest.lablink.repository.LabResultRepository;
import com.techquest.lablink.repository.PatientRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;

@Service
public class LabResultService {

    private final LabResultRepository labResultRepository;
    private final PatientRepository patientRepository;
    private final NotificationService notificationService;
    private final AuditLogService auditLogService;
    private final Path uploadRoot;

    public LabResultService(LabResultRepository labResultRepository,
                             PatientRepository patientRepository,
                             NotificationService notificationService,
                             AuditLogService auditLogService,
                             @Value("${app.upload.dir:uploads}") String uploadDir) {
        this.labResultRepository = labResultRepository;
        this.patientRepository = patientRepository;
        this.notificationService = notificationService;
        this.auditLogService = auditLogService;
        this.uploadRoot = Paths.get(uploadDir).toAbsolutePath().normalize();
    }

    @Transactional
    public LabResultResponse create(LabResultCreateRequest request, User uploadedBy) {
        Patient patient = patientRepository.findById(request.getPatient())
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found."));

        LabResult result = new LabResult();
        result.setPatient(patient);
        result.setUploadedBy(uploadedBy);
        result.setTestType(request.getTestType());
        result.setTestName(request.getTestName());
        result.setResultDetails(request.getResultDetails());
        result.setStatus(request.getStatus() != null ? request.getStatus() : ResultStatus.PENDING);
        result.setTestDate(request.getTestDate());
        result.setNotes(request.getNotes());

        if (request.getResultFile() != null && !request.getResultFile().isEmpty()) {
            result.setResultFile(storeFile(request.getResultFile()));
        }

        LabResult saved = labResultRepository.save(result);

        notificationService.sendResultNotification(saved);
        boolean isDoctorRequest = uploadedBy.getRole() == Role.DOCTOR && saved.getResultFile() == null;
        auditLogService.logAction(uploadedBy, AuditAction.UPLOAD_RESULT, "lab_result", saved.getId().toString(),
                (isDoctorRequest ? "Requested " : "Uploaded ") + saved.getTestName() + " for patient " + patient.getId());

        return LabResultResponse.from(saved);
    }

    @Transactional(readOnly = true)
    public List<LabResultResponse> list(Long patientId, ResultStatus status, com.techquest.lablink.enums.TestType testType) {
        return labResultRepository.findAll().stream()
                .filter(r -> patientId == null || r.getPatient().getId().equals(patientId))
                .filter(r -> status == null || r.getStatus() == status)
                .filter(r -> testType == null || r.getTestType() == testType)
                .map(LabResultResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<LabResultResponse> myResults(User patientUser) {
        Patient patient = patientRepository.findByUserId(patientUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Patient profile not found."));
        return labResultRepository.findByPatientIdOrderByTestDateDesc(patient.getId()).stream()
                .map(LabResultResponse::from)
                .toList();
    }

    @Transactional
    public LabResultResponse getForUser(Long id, User viewer) {
        LabResult result = getOrThrow(id);
        assertViewable(result, viewer);
        auditLogService.logAction(viewer, AuditAction.VIEW_RESULT, "lab_result", id.toString(),
                "Viewed result " + result.getTestName());
        return LabResultResponse.from(result);
    }

    @Transactional
    public LabResultResponse update(Long id, LabResultUpdateRequest request, User actingUser) {
        LabResult result = getOrThrow(id);
        if (request.getTestType() != null) {
            result.setTestType(request.getTestType());
        }
        if (request.getTestName() != null) {
            result.setTestName(request.getTestName());
        }
        if (request.getResultDetails() != null) {
            result.setResultDetails(request.getResultDetails());
        }
        if (request.getNotes() != null) {
            result.setNotes(request.getNotes());
        }
        if (request.getResultFile() != null && !request.getResultFile().isEmpty()) {
            result.setResultFile(storeFile(request.getResultFile()));
        }
        LabResult saved = labResultRepository.save(result);

        auditLogService.logAction(actingUser, AuditAction.UPDATE_RESULT, "lab_result", id.toString(),
                "Updated result " + saved.getTestName());

        return LabResultResponse.from(saved);
    }

    @Transactional
    public LabResultResponse updateStatus(Long id, LabResultStatusUpdateRequest request, User actingUser) {
        LabResult result = getOrThrow(id);
        ResultStatus previousStatus = result.getStatus();
        result.setStatus(request.getStatus());
        LabResult saved = labResultRepository.save(result);

        if (saved.getStatus() != previousStatus) {
            notificationService.sendResultNotification(saved);
        }
        auditLogService.logAction(actingUser, AuditAction.UPDATE_RESULT, "lab_result", id.toString(),
                "Updated status of " + saved.getTestName() + " to " + saved.getStatus().getCode());

        return LabResultResponse.from(saved);
    }

    @Transactional
    public void delete(Long id, User actingUser) {
        LabResult result = getOrThrow(id);
        auditLogService.logAction(actingUser, AuditAction.DELETE_RESULT, "lab_result", id.toString(),
                "Deleted result " + result.getTestName());
        labResultRepository.delete(result);
    }

    @Transactional
    public Resource loadFile(Long id, User viewer) {
        LabResult result = getOrThrow(id);
        assertViewable(result, viewer);
        if (result.getResultFile() == null) {
            throw new ResourceNotFoundException("No file attached to this result.");
        }
        try {
            Path filePath = uploadRoot.resolve(result.getResultFile()).normalize();
            Resource resource = new UrlResource(filePath.toUri());
            if (!resource.exists() || !resource.isReadable()) {
                throw new ResourceNotFoundException("File not found on server.");
            }
            auditLogService.logAction(viewer, AuditAction.DOWNLOAD_RESULT, "lab_result", id.toString(),
                    "Downloaded result " + result.getTestName());
            return resource;
        } catch (MalformedURLException e) {
            throw new ResourceNotFoundException("File not found on server.");
        }
    }

    private String storeFile(MultipartFile file) {
        try {
            LocalDate today = LocalDate.now();
            String relativeDir = "lab_results/" + today.format(DateTimeFormatter.ofPattern("yyyy/MM/dd"));
            Path targetDir = uploadRoot.resolve(relativeDir);
            Files.createDirectories(targetDir);

            String originalName = file.getOriginalFilename() != null ? file.getOriginalFilename() : "file";
            String extension = originalName.contains(".") ? originalName.substring(originalName.lastIndexOf('.')) : "";
            String storedName = UUID.randomUUID() + extension;

            Path targetPath = targetDir.resolve(storedName);
            file.transferTo(targetPath);

            return relativeDir + "/" + storedName;
        } catch (IOException e) {
            throw new RuntimeException("Failed to store uploaded file.", e);
        }
    }

    private void assertViewable(LabResult result, User viewer) {
        if (viewer.getRole() != Role.PATIENT) {
            return;
        }
        Patient patient = patientRepository.findByUserId(viewer.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Lab result not found."));
        if (!result.getPatient().getId().equals(patient.getId())) {
            throw new ResourceNotFoundException("Lab result not found.");
        }
    }

    private LabResult getOrThrow(Long id) {
        return labResultRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Lab result not found."));
    }
}
