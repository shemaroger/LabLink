package com.techquest.lablink.dto.request;

import com.techquest.lablink.enums.ResultStatus;
import com.techquest.lablink.enums.TestType;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;

@Getter
@Setter
public class LabResultCreateRequest {

    @NotNull
    private Long patient;

    @NotNull
    private TestType testType;

    private String testName;

    private String resultDetails;

    private ResultStatus status = ResultStatus.PENDING;

    @NotNull
    private LocalDate testDate;

    private String notes;

    private MultipartFile resultFile;
}
