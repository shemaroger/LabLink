package com.techquest.lablink.service;

import com.techquest.lablink.dto.request.AdminCreatePatientRequest;
import com.techquest.lablink.dto.request.PatientSelfCreateRequest;
import com.techquest.lablink.dto.request.PatientUpdateRequest;
import com.techquest.lablink.dto.request.QueueStatusUpdateRequest;
import com.techquest.lablink.dto.response.PatientResponse;
import com.techquest.lablink.dto.response.QueueItemResponse;
import com.techquest.lablink.enums.AuditAction;
import com.techquest.lablink.enums.QueueStatus;
import com.techquest.lablink.enums.Role;
import com.techquest.lablink.exception.ConflictException;
import com.techquest.lablink.exception.ResourceNotFoundException;
import com.techquest.lablink.model.Patient;
import com.techquest.lablink.model.User;
import com.techquest.lablink.repository.PatientRepository;
import com.techquest.lablink.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDate;
import java.util.List;

@Service
public class PatientService {

    private static final String ALLOWED_PASSWORD_CHARS =
            "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%";

    private final PatientRepository patientRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;
    private final NotificationService notificationService;
    private final AuditLogService auditLogService;
    private final AuthService authService;
    private final SecureRandom secureRandom = new SecureRandom();

    public PatientService(PatientRepository patientRepository,
                           UserRepository userRepository,
                           PasswordEncoder passwordEncoder,
                           EmailService emailService,
                           NotificationService notificationService,
                           AuditLogService auditLogService,
                           AuthService authService) {
        this.patientRepository = patientRepository;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.emailService = emailService;
        this.notificationService = notificationService;
        this.auditLogService = auditLogService;
        this.authService = authService;
    }

    @Transactional
    public PatientResponse createOwnProfile(String email, PatientSelfCreateRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found."));
        if (patientRepository.findByUserId(user.getId()).isPresent()) {
            throw new ConflictException("A patient profile already exists for this user.");
        }
        Patient patient = new Patient();
        patient.setUser(user);
        applySelfFields(patient, request);
        return PatientResponse.from(patientRepository.save(patient));
    }

    @Transactional
    public PatientResponse adminCreatePatient(AdminCreatePatientRequest request, User actingUser) {
        boolean hasEmail = request.getEmail() != null && !request.getEmail().isBlank();
        if (hasEmail && userRepository.existsByEmail(request.getEmail())) {
            throw new ConflictException("A user with this email already exists.");
        }
        String temporaryPassword = generateTemporaryPassword();

        User user = new User();
        user.setEmail(hasEmail ? request.getEmail() : null);
        user.setPassword(passwordEncoder.encode(temporaryPassword));
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setRole(Role.PATIENT);
        user.setMustChangePassword(true);
        user.setEmailVerified(!hasEmail);
        User savedUser = userRepository.save(user);

        Patient patient = new Patient();
        patient.setUser(savedUser);
        patient.setPhone(request.getPhone());
        patient.setDateOfBirth(request.getDateOfBirth());
        patient.setGender(request.getGender());
        patient.setAddress(request.getAddress());
        patient.setBloodGroup(request.getBloodGroup());
        patient.setAllergies(request.getAllergies());
        patient.setEmergencyContactName(request.getEmergencyContactName());
        patient.setEmergencyContactPhone(request.getEmergencyContactPhone());
        patient.setInsuranceProvider(request.getInsuranceProvider());
        patient.setInsuranceCardNumber(request.getInsuranceCardNumber());
        Patient saved = patientRepository.save(patient);

        if (hasEmail) {
            emailService.sendWelcomeEmail(savedUser.getEmail(), savedUser.getFirstName(), temporaryPassword);
            authService.issueEmailVerification(savedUser);
        }
        auditLogService.logAction(actingUser, AuditAction.CREATE_PATIENT, "patient", saved.getId().toString(),
                "Created patient " + savedUser.getFirstName() + " " + savedUser.getLastName());

        Patient queued = assignQueueInternal(saved);

        return PatientResponse.from(queued);
    }

    @Transactional(readOnly = true)
    public PatientResponse getOwnProfile(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found."));
        Patient patient = patientRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Patient profile not found."));
        PatientResponse response = PatientResponse.from(patient);
        if (patient.isQueuedToday() && patient.getQueueStatus() != QueueStatus.DONE) {
            response.setPeopleAhead(patientRepository.countAheadInQueue(patient.getQueueDate(), patient.getQueueNumber()));
        }
        return response;
    }

    @Transactional
    public PatientResponse updateOwnProfile(String email, PatientUpdateRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found."));
        Patient patient = patientRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Patient profile not found."));
        applyUpdateFields(patient, request);
        return PatientResponse.from(patientRepository.save(patient));
    }

    @Transactional(readOnly = true)
    public List<PatientResponse> list(String search) {
        List<Patient> patients = patientRepository.findAll();
        return patients.stream()
                .filter(p -> matchesSearch(p, search))
                .map(PatientResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public PatientResponse getById(Long id) {
        return PatientResponse.from(getPatientOrThrow(id));
    }

    @Transactional
    public PatientResponse update(Long id, PatientUpdateRequest request, User actingUser) {
        Patient patient = getPatientOrThrow(id);
        applyUpdateFields(patient, request);
        Patient saved = patientRepository.save(patient);
        auditLogService.logAction(actingUser, AuditAction.UPDATE_PATIENT, "patient", id.toString(),
                "Updated patient " + saved.getUser().getFirstName() + " " + saved.getUser().getLastName());
        return PatientResponse.from(saved);
    }

    @Transactional
    public void delete(Long id, User actingUser) {
        Patient patient = getPatientOrThrow(id);
        auditLogService.logAction(actingUser, AuditAction.DELETE_PATIENT, "patient", id.toString(),
                "Deleted patient " + patient.getUser().getFirstName() + " " + patient.getUser().getLastName());
        patientRepository.delete(patient);
    }

    @Transactional(readOnly = true)
    public List<QueueItemResponse> todayQueue() {
        return patientRepository.findTodayQueue(LocalDate.now()).stream()
                .map(QueueItemResponse::from)
                .toList();
    }

    @Transactional
    public PatientResponse assignQueue(Long id, User actingUser) {
        Patient patient = getPatientOrThrow(id);
        Patient saved = assignQueueInternal(patient);
        auditLogService.logAction(actingUser, AuditAction.ASSIGN_QUEUE, "patient", id.toString(),
                "Assigned queue number " + saved.getQueueNumber() + " to " + saved.getUser().getFirstName());
        return PatientResponse.from(saved);
    }

    /**
     * Assigns the next queue number for today and notifies the patient of their position.
     * Used both for the manual "assign queue" action and automatically right after registration.
     */
    private Patient assignQueueInternal(Patient patient) {
        LocalDate today = LocalDate.now();
        int nextNumber = patientRepository.findMaxQueueNumberForDate(today) + 1;
        patient.setQueueNumber(nextNumber);
        patient.setQueueStatus(QueueStatus.WAITING);
        patient.setQueueDate(today);
        Patient saved = patientRepository.save(patient);

        long peopleAhead = patientRepository.countAheadInQueue(today, nextNumber);
        notificationService.sendQueueNotification(saved, nextNumber, peopleAhead);
        return saved;
    }

    @Transactional
    public PatientResponse updateQueueStatus(Long id, QueueStatusUpdateRequest request, User actingUser) {
        Patient patient = getPatientOrThrow(id);
        if (!patient.isQueuedToday()) {
            throw new ConflictException("Patient is not queued today.");
        }
        QueueStatus newStatus = request.getQueueStatus();
        patient.setQueueStatus(newStatus);
        Patient saved = patientRepository.save(patient);

        if (newStatus == QueueStatus.CALLED) {
            notificationService.sendQueueCalledNotification(saved);
        } else if (newStatus == QueueStatus.IN_PROGRESS || newStatus == QueueStatus.DONE) {
            notificationService.sendQueueStatusNotification(saved, newStatus);
        }
        if (newStatus == QueueStatus.DONE) {
            notifyWaitingPatientsOfNewPositions(LocalDate.now());
        }
        auditLogService.logAction(actingUser, AuditAction.UPDATE_QUEUE_STATUS, "patient", id.toString(),
                "Updated queue status to " + newStatus.getCode() + " for " + saved.getUser().getFirstName());

        return PatientResponse.from(saved);
    }

    /**
     * Once someone finishes (DONE), everyone still waiting has one fewer person ahead of them —
     * let them know their updated position rather than leaving them to wonder.
     */
    private void notifyWaitingPatientsOfNewPositions(LocalDate today) {
        for (Patient waiting : patientRepository.findWaitingInQueue(today)) {
            long peopleAhead = patientRepository.countAheadInQueue(today, waiting.getQueueNumber());
            notificationService.sendQueuePositionUpdateNotification(waiting, peopleAhead);
        }
    }

    @Transactional
    public PatientResponse resetQueue(Long id, User actingUser) {
        Patient patient = getPatientOrThrow(id);
        patient.setQueueNumber(null);
        patient.setQueueStatus(null);
        patient.setQueueDate(null);
        Patient saved = patientRepository.save(patient);
        auditLogService.logAction(actingUser, AuditAction.UPDATE_QUEUE_STATUS, "patient", id.toString(),
                "Reset queue for " + saved.getUser().getFirstName());
        return PatientResponse.from(saved);
    }

    private void applySelfFields(Patient patient, PatientSelfCreateRequest request) {
        patient.setPhone(request.getPhone());
        patient.setDateOfBirth(request.getDateOfBirth());
        patient.setGender(request.getGender());
        patient.setAddress(request.getAddress());
        patient.setBloodGroup(request.getBloodGroup());
        patient.setAllergies(request.getAllergies());
        patient.setEmergencyContactName(request.getEmergencyContactName());
        patient.setEmergencyContactPhone(request.getEmergencyContactPhone());
        patient.setInsuranceProvider(request.getInsuranceProvider());
        patient.setInsuranceCardNumber(request.getInsuranceCardNumber());
    }

    private void applyUpdateFields(Patient patient, PatientUpdateRequest request) {
        if (request.getFirstName() != null) {
            patient.getUser().setFirstName(request.getFirstName());
        }
        if (request.getLastName() != null) {
            patient.getUser().setLastName(request.getLastName());
        }
        if (request.getPhone() != null) {
            patient.setPhone(request.getPhone());
        }
        if (request.getDateOfBirth() != null) {
            patient.setDateOfBirth(request.getDateOfBirth());
        }
        if (request.getGender() != null) {
            patient.setGender(request.getGender());
        }
        if (request.getAddress() != null) {
            patient.setAddress(request.getAddress());
        }
        if (request.getBloodGroup() != null) {
            patient.setBloodGroup(request.getBloodGroup());
        }
        if (request.getAllergies() != null) {
            patient.setAllergies(request.getAllergies());
        }
        if (request.getEmergencyContactName() != null) {
            patient.setEmergencyContactName(request.getEmergencyContactName());
        }
        if (request.getEmergencyContactPhone() != null) {
            patient.setEmergencyContactPhone(request.getEmergencyContactPhone());
        }
        if (request.getInsuranceProvider() != null) {
            patient.setInsuranceProvider(request.getInsuranceProvider());
        }
        if (request.getInsuranceCardNumber() != null) {
            patient.setInsuranceCardNumber(request.getInsuranceCardNumber());
        }
    }

    private boolean matchesSearch(Patient patient, String search) {
        if (search == null || search.isBlank()) {
            return true;
        }
        String needle = search.toLowerCase();
        User user = patient.getUser();
        return user.getFirstName().toLowerCase().contains(needle)
                || user.getLastName().toLowerCase().contains(needle)
                || user.getEmail().toLowerCase().contains(needle);
    }

    private String generateTemporaryPassword() {
        StringBuilder sb = new StringBuilder(12);
        for (int i = 0; i < 12; i++) {
            sb.append(ALLOWED_PASSWORD_CHARS.charAt(secureRandom.nextInt(ALLOWED_PASSWORD_CHARS.length())));
        }
        return sb.toString();
    }

    private Patient getPatientOrThrow(Long id) {
        return patientRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found."));
    }
}
