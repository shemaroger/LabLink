package com.techquest.lablink.controller;

import com.techquest.lablink.enums.AuditAction;
import com.techquest.lablink.security.UserPrincipal;
import com.techquest.lablink.service.AuditLogService;
import com.techquest.lablink.service.BackupService;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final BackupService backupService;
    private final AuditLogService auditLogService;

    public AdminController(BackupService backupService, AuditLogService auditLogService) {
        this.backupService = backupService;
        this.auditLogService = auditLogService;
    }

    @GetMapping("/backup/")
    public ResponseEntity<Resource> backup(@AuthenticationPrincipal UserPrincipal principal) {
        Resource resource = backupService.createBackup();
        auditLogService.logAction(principal.getUser(), AuditAction.BACKUP_DATABASE, "database", null,
                "Created a database backup: " + resource.getFilename());
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + resource.getFilename() + "\"")
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .body(resource);
    }
}
