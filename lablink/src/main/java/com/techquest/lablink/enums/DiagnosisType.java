package com.techquest.lablink.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum DiagnosisType implements CodedEnum {
    PROVISIONAL("provisional"),
    CONFIRMED("confirmed"),
    REFERRED("referred"),
    FOLLOW_UP("follow_up");

    private final String code;

    DiagnosisType(String code) {
        this.code = code;
    }

    @JsonValue
    public String getCode() {
        return code;
    }

    @JsonCreator
    public static DiagnosisType fromCode(String code) {
        for (DiagnosisType type : values()) {
            if (type.code.equalsIgnoreCase(code)) {
                return type;
            }
        }
        throw new IllegalArgumentException("Unknown diagnosis type: " + code);
    }
}
