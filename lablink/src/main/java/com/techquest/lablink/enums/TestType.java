package com.techquest.lablink.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum TestType implements CodedEnum {
    BLOOD_TEST("blood_test"),
    URINE_TEST("urine_test"),
    STOOL_TEST("stool_test"),
    XRAY("xray"),
    ULTRASOUND("ultrasound"),
    MALARIA("malaria"),
    HIV("hiv"),
    GLUCOSE("glucose"),
    CHOLESTEROL("cholesterol"),
    LIVER_FUNCTION("liver_function"),
    KIDNEY_FUNCTION("kidney_function"),
    FULL_BLOOD_COUNT("full_blood_count"),
    OTHER("other");

    private final String code;

    TestType(String code) {
        this.code = code;
    }

    @JsonValue
    public String getCode() {
        return code;
    }

    @JsonCreator
    public static TestType fromCode(String code) {
        for (TestType type : values()) {
            if (type.code.equalsIgnoreCase(code)) {
                return type;
            }
        }
        throw new IllegalArgumentException("Unknown test type: " + code);
    }
}
