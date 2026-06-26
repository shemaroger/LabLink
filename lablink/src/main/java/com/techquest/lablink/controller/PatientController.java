package com.techquest.lablink.controller;

import com.techquest.lablink.dto.request.AdminCreatePatientRequest;
import com.techquest.lablink.dto.request.PatientSelfCreateRequest;
import com.techquest.lablink.dto.request.PatientUpdateRequest;
import com.techquest.lablink.dto.request.QueueStatusUpdateRequest;
import com.techquest.lablink.dto.response.PatientResponse;
import com.techquest.lablink.dto.response.QueueItemResponse;
import com.techquest.lablink.security.UserPrincipal;
import com.techquest.lablink.service.PatientService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/patients")
public class PatientController {

    private final PatientService patientService;

    public PatientController(PatientService patientService) {
        this.patientService = patientService;
    }

    @PostMapping("/create/")
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<PatientResponse> createOwnProfile(@AuthenticationPrincipal UserPrincipal principal,
                                                              @Valid @RequestBody PatientSelfCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(patientService.createOwnProfile(principal.getUsername(), request));
    }

    @GetMapping("/profile/")
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<PatientResponse> getOwnProfile(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(patientService.getOwnProfile(principal.getUsername()));
    }

    @PatchMapping("/profile/")
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<PatientResponse> updateOwnProfile(@AuthenticationPrincipal UserPrincipal principal,
                                                               @RequestBody PatientUpdateRequest request) {
        return ResponseEntity.ok(patientService.updateOwnProfile(principal.getUsername(), request));
    }

    @PostMapping("/admin-create/")
    @PreAuthorize("hasAnyRole('ADMIN', 'RECEPTIONIST')")
    public ResponseEntity<PatientResponse> adminCreate(@AuthenticationPrincipal UserPrincipal principal,
                                                         @Valid @RequestBody AdminCreatePatientRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(patientService.adminCreatePatient(request, principal.getUser()));
    }

    @GetMapping("/list/")
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR', 'NURSE', 'LAB_STAFF', 'RECEPTIONIST')")
    public ResponseEntity<List<PatientResponse>> list(@RequestParam(required = false) String search) {
        return ResponseEntity.ok(patientService.list(search));
    }

    @GetMapping("/{id}/")
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR', 'NURSE', 'LAB_STAFF', 'RECEPTIONIST')")
    public ResponseEntity<PatientResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(patientService.getById(id));
    }

    @PatchMapping("/{id}/")
    @PreAuthorize("hasAnyRole('ADMIN', 'RECEPTIONIST')")
    public ResponseEntity<PatientResponse> update(@AuthenticationPrincipal UserPrincipal principal,
                                                    @PathVariable Long id,
                                                    @RequestBody PatientUpdateRequest request) {
        return ResponseEntity.ok(patientService.update(id, request, principal.getUser()));
    }

    @DeleteMapping("/{id}/delete/")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@AuthenticationPrincipal UserPrincipal principal, @PathVariable Long id) {
        patientService.delete(id, principal.getUser());
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/queue/today/")
    @PreAuthorize("hasAnyRole('ADMIN', 'RECEPTIONIST')")
    public ResponseEntity<List<QueueItemResponse>> todayQueue() {
        return ResponseEntity.ok(patientService.todayQueue());
    }

    @PostMapping("/{id}/queue/assign/")
    @PreAuthorize("hasAnyRole('ADMIN', 'RECEPTIONIST')")
    public ResponseEntity<PatientResponse> assignQueue(@AuthenticationPrincipal UserPrincipal principal, @PathVariable Long id) {
        return ResponseEntity.ok(patientService.assignQueue(id, principal.getUser()));
    }

    @PatchMapping("/{id}/queue/status/")
    @PreAuthorize("hasAnyRole('ADMIN', 'RECEPTIONIST')")
    public ResponseEntity<PatientResponse> updateQueueStatus(@AuthenticationPrincipal UserPrincipal principal,
                                                               @PathVariable Long id,
                                                               @Valid @RequestBody QueueStatusUpdateRequest request) {
        return ResponseEntity.ok(patientService.updateQueueStatus(id, request, principal.getUser()));
    }

    @PostMapping("/{id}/queue/reset/")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<PatientResponse> resetQueue(@AuthenticationPrincipal UserPrincipal principal, @PathVariable Long id) {
        return ResponseEntity.ok(patientService.resetQueue(id, principal.getUser()));
    }
}
