package com.techquest.lablink.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum QueueStatus implements CodedEnum {
    WAITING("waiting"),
    CALLED("called"),
    IN_PROGRESS("in_progress"),
    DONE("done");

    private final String code;

    QueueStatus(String code) {
        this.code = code;
    }

    @JsonValue
    public String getCode() {
        return code;
    }

    @JsonCreator
    public static QueueStatus fromCode(String code) {
        for (QueueStatus status : values()) {
            if (status.code.equalsIgnoreCase(code)) {
                return status;
            }
        }
        throw new IllegalArgumentException("Unknown queue status: " + code);
    }
}
