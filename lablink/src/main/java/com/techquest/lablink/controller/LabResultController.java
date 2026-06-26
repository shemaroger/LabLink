package com.techquest.lablink.controller;

import com.techquest.lablink.dto.request.LabResultCreateRequest;
import com.techquest.lablink.dto.request.LabResultStatusUpdateRequest;
import com.techquest.lablink.dto.request.LabResultUpdateRequest;
import com.techquest.lablink.dto.response.LabResultResponse;
import com.techquest.lablink.enums.ResultStatus;
import com.techquest.lablink.enums.TestType;
import com.techquest.lablink.security.UserPrincipal;
import com.techquest.lablink.service.LabResultService;
import jakarta.validation.Valid;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/results")
public class LabResultController {

    private final LabResultService labResultService;

    public LabResultController(LabResultService labResultService) {
        this.labResultService = labResultService;
    }

    @PostMapping(value = "/create/", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAnyRole('ADMIN', 'LAB_STAFF', 'DOCTOR')")
    public ResponseEntity<LabResultResponse> create(@AuthenticationPrincipal UserPrincipal principal,
                                                       @Valid @ModelAttribute LabResultCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(labResultService.create(request, principal.getUser()));
    }

    @GetMapping("/list/")
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR', 'NURSE', 'LAB_STAFF', 'RECEPTIONIST')")
    public ResponseEntity<List<LabResultResponse>> list(@RequestParam(required = false) Long patientId,
                                                           @RequestParam(required = false) ResultStatus status,
                                                           @RequestParam(required = false) TestType testType) {
        return ResponseEntity.ok(labResultService.list(patientId, status, testType));
    }

    @GetMapping("/my-results/")
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<List<LabResultResponse>> myResults(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(labResultService.myResults(principal.getUser()));
    }

    @GetMapping("/{id}/")
    public ResponseEntity<LabResultResponse> getById(@AuthenticationPrincipal UserPrincipal principal, @PathVariable Long id) {
        return ResponseEntity.ok(labResultService.getForUser(id, principal.getUser()));
    }

    @RequestMapping(value = "/{id}/update/", method = {RequestMethod.PUT, RequestMethod.PATCH},
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAnyRole('ADMIN', 'LAB_STAFF')")
    public ResponseEntity<LabResultResponse> update(@AuthenticationPrincipal UserPrincipal principal,
                                                       @PathVariable Long id,
                                                       @ModelAttribute LabResultUpdateRequest request) {
        return ResponseEntity.ok(labResultService.update(id, request, principal.getUser()));
    }

    @PatchMapping("/{id}/status/")
    @PreAuthorize("hasAnyRole('ADMIN', 'LAB_STAFF', 'DOCTOR')")
    public ResponseEntity<LabResultResponse> updateStatus(@AuthenticationPrincipal UserPrincipal principal,
                                                             @PathVariable Long id,
                                                             @Valid @RequestBody LabResultStatusUpdateRequest request) {
        return ResponseEntity.ok(labResultService.updateStatus(id, request, principal.getUser()));
    }

    @DeleteMapping("/{id}/delete/")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@AuthenticationPrincipal UserPrincipal principal, @PathVariable Long id) {
        labResultService.delete(id, principal.getUser());
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/download/")
    public ResponseEntity<Resource> download(@AuthenticationPrincipal UserPrincipal principal, @PathVariable Long id) {
        Resource resource = labResultService.loadFile(id, principal.getUser());
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + resource.getFilename() + "\"")
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .body(resource);
    }
}
