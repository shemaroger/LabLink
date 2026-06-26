package com.techquest.lablink.dto.response;

import com.techquest.lablink.enums.AuditAction;
import com.techquest.lablink.model.AuditLog;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class AuditLogResponse {

    private Long id;
    private UserSummary user;
    private AuditAction action;
    private String affectedEntity;
    private String entityId;
    private String description;
    private String ipAddress;
    private LocalDateTime timestamp;

    public static AuditLogResponse from(AuditLog log) {
        AuditLogResponse response = new AuditLogResponse();
        response.setId(log.getId());
        response.setUser(log.getUser() != null ? UserSummary.from(log.getUser()) : null);
        response.setAction(log.getAction());
        response.setAffectedEntity(log.getAffectedEntity());
        response.setEntityId(log.getEntityId());
        response.setDescription(log.getDescription());
        response.setIpAddress(log.getIpAddress());
        response.setTimestamp(log.getTimestamp());
        return response;
    }
}
