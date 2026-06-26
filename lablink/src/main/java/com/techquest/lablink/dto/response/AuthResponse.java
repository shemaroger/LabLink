package com.techquest.lablink.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class AuthResponse {

    private final TokenPairResponse tokens;
    private final UserResponse user;
}
