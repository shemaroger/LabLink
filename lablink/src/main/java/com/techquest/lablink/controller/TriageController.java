package com.techquest.lablink.controller;

import com.techquest.lablink.dto.request.TriageCreateRequest;
import com.techquest.lablink.dto.request.TriageUpdateRequest;
import com.techquest.lablink.dto.response.TriageResponse;
import com.techquest.lablink.enums.UrgencyLevel;
import com.techquest.lablink.security.UserPrincipal;
import com.techquest.lablink.service.TriageService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/triage")
@PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR', 'NURSE')")
public class TriageController {

    private final TriageService triageService;

    public TriageController(TriageService triageService) {
        this.triageService = triageService;
    }

    @PostMapping("/create/")
    @PreAuthorize("hasRole('NURSE')")
    public ResponseEntity<TriageResponse> create(@AuthenticationPrincipal UserPrincipal principal,
                                                   @Valid @RequestBody TriageCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(triageService.create(request, principal.getUser()));
    }

    @GetMapping("/list/")
    public ResponseEntity<List<TriageResponse>> list(@RequestParam(required = false) Long patientId,
                                                        @RequestParam(required = false) UrgencyLevel urgency) {
        return ResponseEntity.ok(triageService.list(patientId, urgency));
    }

    @GetMapping("/{id}/")
    public ResponseEntity<TriageResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(triageService.getById(id));
    }

    @RequestMapping(value = "/{id}/", method = {RequestMethod.PATCH, RequestMethod.PUT})
    public ResponseEntity<TriageResponse> update(@AuthenticationPrincipal UserPrincipal principal,
                                                   @PathVariable Long id,
                                                   @RequestBody TriageUpdateRequest request) {
        return ResponseEntity.ok(triageService.update(id, request, principal.getUser()));
    }

    @GetMapping("/patient/{patientId}/")
    public ResponseEntity<List<TriageResponse>> forPatient(@PathVariable Long patientId) {
        return ResponseEntity.ok(triageService.forPatient(patientId));
    }
}
