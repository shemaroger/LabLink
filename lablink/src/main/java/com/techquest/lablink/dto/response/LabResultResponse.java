package com.techquest.lablink.dto.response;

import com.techquest.lablink.enums.ResultStatus;
import com.techquest.lablink.enums.TestType;
import com.techquest.lablink.model.LabResult;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
public class LabResultResponse {

    private Long id;
    private PatientSummary patient;
    private TestType testType;
    private String testTypeDisplay;
    private String testName;
    private String resultDetails;
    private ResultStatus status;
    private LocalDate testDate;
    private String resultFile;
    private String notes;
    private LocalDateTime createdAt;

    public static LabResultResponse from(LabResult result) {
        LabResultResponse response = new LabResultResponse();
        response.setId(result.getId());
        response.setPatient(PatientSummary.from(result.getPatient()));
        response.setTestType(result.getTestType());
        response.setTestTypeDisplay(toDisplay(result.getTestType().getCode()));
        response.setTestName(result.getTestName());
        response.setResultDetails(result.getResultDetails());
        response.setStatus(result.getStatus());
        response.setTestDate(result.getTestDate());
        response.setResultFile(result.getResultFile() != null ? "/api/results/" + result.getId() + "/download/" : null);
        response.setNotes(result.getNotes());
        response.setCreatedAt(result.getUploadDate());
        return response;
    }

    private static String toDisplay(String code) {
        String[] parts = code.split("_");
        StringBuilder sb = new StringBuilder();
        for (String part : parts) {
            if (sb.length() > 0) {
                sb.append(' ');
            }
            sb.append(Character.toUpperCase(part.charAt(0))).append(part.substring(1));
        }
        return sb.toString();
    }
}
