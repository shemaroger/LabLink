package com.techquest.lablink.dto.request;

import com.techquest.lablink.enums.TestType;
import lombok.Getter;
import lombok.Setter;
import org.springframework.web.multipart.MultipartFile;

@Getter
@Setter
public class LabResultUpdateRequest {

    private TestType testType;

    private String testName;

    private String resultDetails;

    private String notes;

    private MultipartFile resultFile;
}
