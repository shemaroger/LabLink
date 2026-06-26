package com.techquest.lablink.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum Role implements CodedEnum {
    PATIENT("patient"),
    LAB_STAFF("lab_staff"),
    NURSE("nurse"),
    DOCTOR("doctor"),
    RECEPTIONIST("receptionist"),
    ADMIN("admin"),
    HOSPITAL_ADMIN("hospital_admin");

    private final String code;

    Role(String code) {
        this.code = code;
    }

    @JsonValue
    public String getCode() {
        return code;
    }

    @JsonCreator
    public static Role fromCode(String code) {
        for (Role role : values()) {
            if (role.code.equalsIgnoreCase(code)) {
                return role;
            }
        }
        throw new IllegalArgumentException("Unknown role: " + code);
    }
}
