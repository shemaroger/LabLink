package com.techquest.lablink.controller;

import com.techquest.lablink.dto.request.ConsultationCreateRequest;
import com.techquest.lablink.dto.response.ConsultationResponse;
import com.techquest.lablink.security.UserPrincipal;
import com.techquest.lablink.service.ConsultationService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/consultations")
@PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR')")
public class ConsultationController {

    private final ConsultationService consultationService;

    public ConsultationController(ConsultationService consultationService) {
        this.consultationService = consultationService;
    }

    @PostMapping("/create/")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<ConsultationResponse> create(@AuthenticationPrincipal UserPrincipal principal,
                                                          @Valid @RequestBody ConsultationCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(consultationService.create(request, principal.getUser()));
    }

    @GetMapping("/list/")
    public ResponseEntity<List<ConsultationResponse>> list(@RequestParam(required = false) Long patientId) {
        return ResponseEntity.ok(consultationService.list(patientId));
    }

    @GetMapping("/{id}/")
    public ResponseEntity<ConsultationResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(consultationService.getById(id));
    }

    @GetMapping("/patient/{patientId}/")
    public ResponseEntity<List<ConsultationResponse>> forPatient(@PathVariable Long patientId) {
        return ResponseEntity.ok(consultationService.forPatient(patientId));
    }
}
