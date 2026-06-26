package com.techquest.lablink.dto.response;

import com.techquest.lablink.model.User;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UserSummary {

    private Long id;
    private String email;

    public static UserSummary from(User user) {
        UserSummary summary = new UserSummary();
        summary.setId(user.getId());
        summary.setEmail(user.getEmail());
        return summary;
    }
}
