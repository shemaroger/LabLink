package com.techquest.lablink.dto.request;

import com.techquest.lablink.enums.Role;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdateUserRequest {

    private String firstName;

    private String lastName;

    private String email;

    private String phone;

    private Role role;

    private Boolean isActive;
}
