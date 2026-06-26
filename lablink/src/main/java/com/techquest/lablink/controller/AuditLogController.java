package com.techquest.lablink.controller;

import com.techquest.lablink.dto.response.AuditLogResponse;
import com.techquest.lablink.dto.response.AuditStatsResponse;
import com.techquest.lablink.security.UserPrincipal;
import com.techquest.lablink.service.AuditLogService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/audit-logs")
public class AuditLogController {

    private final AuditLogService auditLogService;

    public AuditLogController(AuditLogService auditLogService) {
        this.auditLogService = auditLogService;
    }

    @GetMapping("/all/")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<AuditLogResponse>> all() {
        return ResponseEntity.ok(auditLogService.findAll());
    }

    @GetMapping("/all/{id}/")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<AuditLogResponse> byId(@PathVariable Long id) {
        return ResponseEntity.ok(auditLogService.findById(id));
    }

    @GetMapping("/my/")
    public ResponseEntity<List<AuditLogResponse>> my(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(auditLogService.findByUser(principal.getUser().getId()));
    }

    @GetMapping("/stats/")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<AuditStatsResponse> stats() {
        return ResponseEntity.ok(auditLogService.stats());
    }
}
