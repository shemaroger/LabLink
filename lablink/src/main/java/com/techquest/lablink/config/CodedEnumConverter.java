package com.techquest.lablink.config;

import com.techquest.lablink.enums.CodedEnum;
import org.springframework.core.convert.converter.Converter;

/**
 * Converts query/path/form-data string values to enum constants using their CodedEnum
 * code (e.g. "blood_test"), the same value Jackson accepts in JSON bodies. Without this,
 * Spring's default enum conversion only accepts the literal constant name (e.g. "BLOOD_TEST").
 */
public class CodedEnumConverter<T extends Enum<T> & CodedEnum> implements Converter<String, T> {

    private final Class<T> enumType;

    public CodedEnumConverter(Class<T> enumType) {
        this.enumType = enumType;
    }

    @Override
    public T convert(String source) {
        for (T constant : enumType.getEnumConstants()) {
            if (constant.getCode().equalsIgnoreCase(source)) {
                return constant;
            }
        }
        throw new IllegalArgumentException("Unknown value '" + source + "' for " + enumType.getSimpleName());
    }
}
