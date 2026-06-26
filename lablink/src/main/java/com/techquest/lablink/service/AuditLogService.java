package com.techquest.lablink.service;

import com.techquest.lablink.dto.response.AuditLogResponse;
import com.techquest.lablink.dto.response.AuditStatsResponse;
import com.techquest.lablink.enums.AuditAction;
import com.techquest.lablink.model.AuditLog;
import com.techquest.lablink.model.User;
import com.techquest.lablink.repository.AuditLogRepository;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class AuditLogService {

    private final AuditLogRepository auditLogRepository;
    private final HttpServletRequest request;

    public AuditLogService(AuditLogRepository auditLogRepository, HttpServletRequest request) {
        this.auditLogRepository = auditLogRepository;
        this.request = request;
    }

    @Transactional
    public void logAction(User user, AuditAction action, String affectedEntity, String entityId, String description) {
        AuditLog log = new AuditLog();
        log.setUser(user);
        log.setAction(action);
        log.setAffectedEntity(affectedEntity);
        log.setEntityId(entityId);
        log.setDescription(description);
        log.setIpAddress(extractClientIp());
        log.setUserAgent(request.getHeader("User-Agent"));
        auditLogRepository.save(log);
    }

    @Transactional(readOnly = true)
    public List<AuditLogResponse> findAll() {
        return auditLogRepository.findAll().stream().map(AuditLogResponse::from).toList();
    }

    @Transactional(readOnly = true)
    public AuditLogResponse findById(Long id) {
        return auditLogRepository.findById(id)
                .map(AuditLogResponse::from)
                .orElseThrow(() -> new com.techquest.lablink.exception.ResourceNotFoundException("Audit log not found."));
    }

    @Transactional(readOnly = true)
    public List<AuditLogResponse> findByUser(Long userId) {
        return auditLogRepository.findByUserIdOrderByTimestampDesc(userId).stream().map(AuditLogResponse::from).toList();
    }

    public AuditStatsResponse stats() {
        LocalDateTime now = LocalDateTime.now();
        long total = auditLogRepository.count();
        long today = auditLogRepository.countByTimestampAfter(now.toLocalDate().atStartOfDay());
        long last7Days = auditLogRepository.countByTimestampAfter(now.minusDays(7));
        long last30Days = auditLogRepository.countByTimestampAfter(now.minusDays(30));

        List<Map<String, Object>> topActions = auditLogRepository.countGroupedByAction().stream()
                .limit(5)
                .map(row -> {
                    Map<String, Object> map = new LinkedHashMap<>();
                    map.put("action", ((AuditAction) row[0]).getCode());
                    map.put("count", row[1]);
                    return map;
                })
                .toList();

        List<Map<String, Object>> topUsers = auditLogRepository.countGroupedByUser().stream()
                .limit(5)
                .map(row -> {
                    Map<String, Object> map = new LinkedHashMap<>();
                    map.put("user_id", row[0]);
                    map.put("email", row[1]);
                    map.put("count", row[2]);
                    return map;
                })
                .toList();

        return new AuditStatsResponse(total, today, last7Days, last30Days, topActions, topUsers);
    }

    private String extractClientIp() {
        String forwarded = request.getHeader("X-Forwarded-For");
        if (forwarded != null && !forwarded.isBlank()) {
            return forwarded.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}
