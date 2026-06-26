package com.techquest.lablink.controller;

import com.techquest.lablink.dto.request.SendNotificationRequest;
import com.techquest.lablink.dto.response.ApiResponse;
import com.techquest.lablink.dto.response.NotificationResponse;
import com.techquest.lablink.enums.DeliveryMethod;
import com.techquest.lablink.enums.NotificationStatus;
import com.techquest.lablink.security.UserPrincipal;
import com.techquest.lablink.service.NotificationService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @GetMapping("/my/")
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<List<NotificationResponse>> myNotifications(@AuthenticationPrincipal UserPrincipal principal,
                                                                         @RequestParam(required = false) NotificationStatus status) {
        Long patientId = notificationService.resolvePatientId(principal.getUser());
        return ResponseEntity.ok(notificationService.findForPatient(patientId, status));
    }

    @GetMapping("/my/{id}/")
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<NotificationResponse> myNotification(@AuthenticationPrincipal UserPrincipal principal, @PathVariable Long id) {
        Long patientId = notificationService.resolvePatientId(principal.getUser());
        return ResponseEntity.ok(notificationService.findForPatient(patientId, id));
    }

    @PatchMapping("/my/{id}/read/")
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<NotificationResponse> markRead(@AuthenticationPrincipal UserPrincipal principal, @PathVariable Long id) {
        Long patientId = notificationService.resolvePatientId(principal.getUser());
        return ResponseEntity.ok(notificationService.markRead(patientId, id));
    }

    @PatchMapping("/my/read-all/")
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<ApiResponse> markAllRead(@AuthenticationPrincipal UserPrincipal principal) {
        Long patientId = notificationService.resolvePatientId(principal.getUser());
        notificationService.markAllRead(patientId);
        return ResponseEntity.ok(new ApiResponse("All notifications marked as read."));
    }

    @GetMapping("/unread-count/")
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<Map<String, Long>> unreadCount(@AuthenticationPrincipal UserPrincipal principal) {
        Long patientId = notificationService.resolvePatientId(principal.getUser());
        return ResponseEntity.ok(Map.of("unread_count", notificationService.unreadCount(patientId)));
    }

    @GetMapping("/all/")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<NotificationResponse>> all(@RequestParam(required = false) Long patientId,
                                                              @RequestParam(required = false) NotificationStatus status,
                                                              @RequestParam(required = false) DeliveryMethod deliveryMethod) {
        return ResponseEntity.ok(notificationService.findAll(patientId, status, deliveryMethod));
    }

    @PostMapping("/send/")
    @PreAuthorize("hasAnyRole('ADMIN', 'LAB_STAFF')")
    public ResponseEntity<NotificationResponse> send(@Valid @RequestBody SendNotificationRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(notificationService.sendManual(request));
    }
}
