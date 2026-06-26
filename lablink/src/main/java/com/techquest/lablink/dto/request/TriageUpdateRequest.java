package com.techquest.lablink.dto.request;

import com.techquest.lablink.enums.UrgencyLevel;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
public class TriageUpdateRequest {

    private BigDecimal temperature;

    private String bloodPressure;

    private Integer pulseRate;

    private Integer respiratoryRate;

    private BigDecimal weight;

    private BigDecimal height;

    private String chiefComplaint;

    private String symptoms;

    private UrgencyLevel urgencyLevel;

    private String notes;
}
