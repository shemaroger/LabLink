package com.techquest.lablink.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum ResultStatus implements CodedEnum {
    PENDING("pending"),
    PROCESSING("processing"),
    AVAILABLE("available"),
    REVIEWED("reviewed");

    private final String code;

    ResultStatus(String code) {
        this.code = code;
    }

    @JsonValue
    public String getCode() {
        return code;
    }

    @JsonCreator
    public static ResultStatus fromCode(String code) {
        for (ResultStatus status : values()) {
            if (status.code.equalsIgnoreCase(code)) {
                return status;
            }
        }
        throw new IllegalArgumentException("Unknown result status: " + code);
    }
}
