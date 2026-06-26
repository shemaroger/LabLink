package com.techquest.lablink.service;

import com.techquest.lablink.dto.request.SendNotificationRequest;
import com.techquest.lablink.dto.response.NotificationResponse;
import com.techquest.lablink.enums.DeliveryMethod;
import com.techquest.lablink.enums.NotificationStatus;
import com.techquest.lablink.enums.QueueStatus;
import com.techquest.lablink.exception.ResourceNotFoundException;
import com.techquest.lablink.model.LabResult;
import com.techquest.lablink.model.Notification;
import com.techquest.lablink.model.Patient;
import com.techquest.lablink.model.User;
import com.techquest.lablink.repository.NotificationRepository;
import com.techquest.lablink.repository.PatientRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final PatientRepository patientRepository;
    private final EmailService emailService;
    private final SmsService smsService;

    public NotificationService(NotificationRepository notificationRepository,
                                PatientRepository patientRepository,
                                EmailService emailService,
                                SmsService smsService) {
        this.notificationRepository = notificationRepository;
        this.patientRepository = patientRepository;
        this.emailService = emailService;
        this.smsService = smsService;
    }

    @Transactional
    public void sendResultNotification(LabResult result) {
        Patient patient = result.getPatient();
        String title = "Lab Result Update";
        String message = statusMessage(result);

        Notification notification = new Notification();
        notification.setPatient(patient);
        notification.setResult(result);
        notification.setTitle(title);
        notification.setMessage(message);
        notification.setDeliveryMethod(DeliveryMethod.IN_APP);
        notification.setStatus(NotificationStatus.SENT);
        notification.setSentAt(LocalDateTime.now());
        notificationRepository.save(notification);

        routeExternalNotification(patient, title, message);
    }

    private String statusMessage(LabResult result) {
        String testName = result.getTestName();
        return switch (result.getStatus()) {
            case PENDING -> "Your " + testName + " test has been ordered and is pending processing.";
            case PROCESSING -> "Your " + testName + " test is now being processed.";
            case AVAILABLE -> "Your " + testName + " result is now available.";
            case REVIEWED -> "Your " + testName + " result has been reviewed by your doctor.";
        };
    }

    /**
     * Sends via every channel the patient has on file: email if present, SMS if a phone is on file.
     * Not a fallback — both fire when both contact methods exist.
     */
    private void routeExternalNotification(Patient patient, String title, String message) {
        String email = patient.getUser().getEmail();
        if (email != null && !email.isBlank()) {
            emailService.sendNotificationEmail(email, title, message);
        }
        if (patient.getPhone() != null && !patient.getPhone().isBlank()) {
            smsService.sendSms(patient.getPhone(), title + ": " + message);
        }
    }

    @Transactional
    public void sendQueueNotification(Patient patient, int queueNumber, long peopleAhead) {
        String title = "Queue Assigned";
        String message = "You have been registered and assigned queue number " + queueNumber + ". "
                + aheadPhrase(peopleAhead);
        save(patient, title, message);
        routeExternalNotification(patient, title, message);
    }

    @Transactional
    public void sendQueuePositionUpdateNotification(Patient patient, long peopleAhead) {
        String title = "Queue Update";
        String message = "Queue update for number " + patient.getQueueNumber() + ": " + aheadPhrase(peopleAhead);
        save(patient, title, message);
        routeExternalNotification(patient, title, message);
    }

    @Transactional
    public void sendQueueCalledNotification(Patient patient) {
        String title = "You're Being Called";
        String message = "Please proceed, it is your turn.";
        save(patient, title, message);
        routeExternalNotification(patient, title, message);
    }

    @Transactional
    public void sendQueueStatusNotification(Patient patient, QueueStatus newStatus) {
        String title = "Queue Status Updated";
        String message = "Your queue status has been updated to " + newStatus.getCode() + ".";
        save(patient, title, message);
        routeExternalNotification(patient, title, message);
    }

    private String aheadPhrase(long peopleAhead) {
        if (peopleAhead <= 0) {
            return "You are next!";
        }
        return "There " + (peopleAhead == 1 ? "is 1 patient" : "are " + peopleAhead + " patients") + " ahead of you.";
    }

    @Transactional
    public NotificationResponse sendManual(SendNotificationRequest request) {
        Patient patient = patientRepository.findById(request.getPatient())
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found."));
        Notification notification = new Notification();
        notification.setPatient(patient);
        notification.setTitle(request.getTitle());
        notification.setMessage(request.getMessage());
        notification.setDeliveryMethod(request.getDeliveryMethod());
        notification.setStatus(NotificationStatus.SENT);
        notification.setSentAt(LocalDateTime.now());
        return NotificationResponse.from(notificationRepository.save(notification));
    }

    private void save(Patient patient, String title, String message) {
        Notification notification = new Notification();
        notification.setPatient(patient);
        notification.setTitle(title);
        notification.setMessage(message);
        notification.setDeliveryMethod(DeliveryMethod.IN_APP);
        notification.setStatus(NotificationStatus.SENT);
        notification.setSentAt(LocalDateTime.now());
        notificationRepository.save(notification);
    }

    @Transactional(readOnly = true)
    public Long resolvePatientId(User patientUser) {
        return patientRepository.findByUserId(patientUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Patient profile not found."))
                .getId();
    }

    @Transactional(readOnly = true)
    public List<NotificationResponse> findForPatient(Long patientId, NotificationStatus statusFilter) {
        List<Notification> notifications = statusFilter != null
                ? notificationRepository.findByPatientIdAndStatusOrderByCreatedAtDesc(patientId, statusFilter)
                : notificationRepository.findByPatientIdOrderByCreatedAtDesc(patientId);
        return notifications.stream().map(NotificationResponse::from).toList();
    }

    @Transactional(readOnly = true)
    public NotificationResponse findForPatient(Long patientId, Long notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found."));
        if (!notification.getPatient().getId().equals(patientId)) {
            throw new ResourceNotFoundException("Notification not found.");
        }
        return NotificationResponse.from(notification);
    }

    @Transactional
    public NotificationResponse markRead(Long patientId, Long notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found."));
        if (!notification.getPatient().getId().equals(patientId)) {
            throw new ResourceNotFoundException("Notification not found.");
        }
        notification.setStatus(NotificationStatus.READ);
        notification.setReadAt(LocalDateTime.now());
        return NotificationResponse.from(notificationRepository.save(notification));
    }

    @Transactional
    public void markAllRead(Long patientId) {
        List<Notification> notifications = notificationRepository.findByPatientIdOrderByCreatedAtDesc(patientId);
        LocalDateTime now = LocalDateTime.now();
        notifications.stream()
                .filter(n -> n.getStatus() != NotificationStatus.READ)
                .forEach(n -> {
                    n.setStatus(NotificationStatus.READ);
                    n.setReadAt(now);
                });
        notificationRepository.saveAll(notifications);
    }

    public long unreadCount(Long patientId) {
        return notificationRepository.countByPatientIdAndDeliveryMethodAndStatusNot(
                patientId, DeliveryMethod.IN_APP, NotificationStatus.READ);
    }

    @Transactional(readOnly = true)
    public List<NotificationResponse> findAll(Long patientId, NotificationStatus status, DeliveryMethod deliveryMethod) {
        return notificationRepository.findAll().stream()
                .filter(n -> patientId == null || n.getPatient().getId().equals(patientId))
                .filter(n -> status == null || n.getStatus() == status)
                .filter(n -> deliveryMethod == null || n.getDeliveryMethod() == deliveryMethod)
                .map(NotificationResponse::from)
                .toList();
    }
}
