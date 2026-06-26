package com.techquest.lablink.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum AuditAction implements CodedEnum {
    LOGIN("login"),
    LOGOUT("logout"),
    REGISTER("register"),
    VIEW_RESULT("view_result"),
    DOWNLOAD_RESULT("download_result"),
    UPLOAD_RESULT("upload_result"),
    UPDATE_RESULT("update_result"),
    DELETE_RESULT("delete_result"),
    CREATE_PATIENT("create_patient"),
    UPDATE_PATIENT("update_patient"),
    DELETE_PATIENT("delete_patient"),
    SEND_NOTIFICATION("send_notification"),
    CHANGE_PASSWORD("change_password"),
    UPDATE_PROFILE("update_profile"),
    UPDATE_USER("update_user"),
    ASSIGN_QUEUE("assign_queue"),
    UPDATE_QUEUE_STATUS("update_queue_status"),
    CREATE_TRIAGE("create_triage"),
    CREATE_CONSULTATION("create_consultation"),
    MFA_ENABLED("mfa_enabled"),
    MFA_DISABLED("mfa_disabled"),
    PASSWORD_RESET_REQUESTED("password_reset_requested"),
    PASSWORD_RESET_COMPLETED("password_reset_completed"),
    EMAIL_VERIFIED("email_verified"),
    BACKUP_DATABASE("backup_database"),
    OTHER("other");

    private final String code;

    AuditAction(String code) {
        this.code = code;
    }

    @JsonValue
    public String getCode() {
        return code;
    }

    @JsonCreator
    public static AuditAction fromCode(String code) {
        for (AuditAction action : values()) {
            if (action.code.equalsIgnoreCase(code)) {
                return action;
            }
        }
        throw new IllegalArgumentException("Unknown audit action: " + code);
    }
}
