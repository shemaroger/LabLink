package com.techquest.lablink.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class TokenPairResponse {

    private final String access;
    private final String refresh;
}
