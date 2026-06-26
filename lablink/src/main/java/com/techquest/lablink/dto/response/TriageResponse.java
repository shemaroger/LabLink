package com.techquest.lablink.dto.response;

import com.techquest.lablink.enums.UrgencyLevel;
import com.techquest.lablink.model.TriageRecord;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
public class TriageResponse {

    private Long id;
    private PatientSummary patient;
    private BigDecimal temperature;
    private String bloodPressure;
    private Integer pulseRate;
    private Integer respiratoryRate;
    private BigDecimal weight;
    private BigDecimal height;
    private BigDecimal bmi;
    private String chiefComplaint;
    private String symptoms;
    private UrgencyLevel urgencyLevel;
    private String notes;
    private LocalDateTime createdAt;

    public static TriageResponse from(TriageRecord record) {
        TriageResponse response = new TriageResponse();
        response.setId(record.getId());
        response.setPatient(PatientSummary.from(record.getPatient()));
        response.setTemperature(record.getTemperature());
        response.setBloodPressure(record.getBloodPressure());
        response.setPulseRate(record.getPulseRate());
        response.setRespiratoryRate(record.getRespiratoryRate());
        response.setWeight(record.getWeight());
        response.setHeight(record.getHeight());
        response.setBmi(record.getBmi());
        response.setChiefComplaint(record.getChiefComplaint());
        response.setSymptoms(record.getSymptoms());
        response.setUrgencyLevel(record.getUrgencyLevel());
        response.setNotes(record.getNotes());
        response.setCreatedAt(record.getCreatedAt());
        return response;
    }
}
