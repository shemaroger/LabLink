package com.techquest.lablink.config;

import com.techquest.lablink.enums.*;
import org.springframework.context.annotation.Configuration;
import org.springframework.format.FormatterRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addFormatters(FormatterRegistry registry) {
        registerEnum(registry, Role.class);
        registerEnum(registry, QueueStatus.class);
        registerEnum(registry, TestType.class);
        registerEnum(registry, ResultStatus.class);
        registerEnum(registry, UrgencyLevel.class);
        registerEnum(registry, DiagnosisType.class);
        registerEnum(registry, DeliveryMethod.class);
        registerEnum(registry, NotificationStatus.class);
        registerEnum(registry, AuditAction.class);
    }

    private <T extends Enum<T> & CodedEnum> void registerEnum(FormatterRegistry registry, Class<T> enumType) {
        registry.addConverter(String.class, enumType, new CodedEnumConverter<>(enumType));
    }
}
