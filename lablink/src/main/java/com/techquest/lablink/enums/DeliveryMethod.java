package com.techquest.lablink.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum DeliveryMethod implements CodedEnum {
    EMAIL("email"),
    SMS("sms"),
    IN_APP("in_app");

    private final String code;

    DeliveryMethod(String code) {
        this.code = code;
    }

    @JsonValue
    public String getCode() {
        return code;
    }

    @JsonCreator
    public static DeliveryMethod fromCode(String code) {
        for (DeliveryMethod method : values()) {
            if (method.code.equalsIgnoreCase(code)) {
                return method;
            }
        }
        throw new IllegalArgumentException("Unknown delivery method: " + code);
    }
}
