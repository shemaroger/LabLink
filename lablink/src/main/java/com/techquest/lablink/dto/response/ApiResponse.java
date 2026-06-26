package com.techquest.lablink.dto.response;

import lombok.Getter;

@Getter
public class ApiResponse {

    private final String detail;

    public ApiResponse(String detail) {
        this.detail = detail;
    }
}
