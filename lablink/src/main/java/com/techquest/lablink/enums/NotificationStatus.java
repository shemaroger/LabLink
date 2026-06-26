package com.techquest.lablink.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum NotificationStatus implements CodedEnum {
    PENDING("pending"),
    SENT("sent"),
    DELIVERED("delivered"),
    FAILED("failed"),
    READ("read");

    private final String code;

    NotificationStatus(String code) {
        this.code = code;
    }

    @JsonValue
    public String getCode() {
        return code;
    }

    @JsonCreator
    public static NotificationStatus fromCode(String code) {
        for (NotificationStatus status : values()) {
            if (status.code.equalsIgnoreCase(code)) {
                return status;
            }
        }
        throw new IllegalArgumentException("Unknown notification status: " + code);
    }
}
