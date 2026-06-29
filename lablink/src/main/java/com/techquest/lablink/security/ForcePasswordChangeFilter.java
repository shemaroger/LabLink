package com.techquest.lablink.security;

import com.techquest.lablink.model.User;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.MediaType;
import org.springframework.lang.NonNull;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Set;

/**
 * Blocks every authenticated request except a small whitelist while a user has
 * mustChangePassword set, so the frontend's redirect-to-change-password can't be bypassed
 * by hitting the API directly with a still-valid token.
 */
@Component
public class ForcePasswordChangeFilter extends OncePerRequestFilter {

    private static final Set<String> ALLOWED_PATHS = Set.of(
            "/api/users/profile/",
            "/api/users/change-password/",
            "/api/users/logout/"
    );

    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request,
                                     @NonNull HttpServletResponse response,
                                     @NonNull FilterChain filterChain) throws ServletException, IOException {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof UserPrincipal principal) {
            User user = principal.getUser();
            if (user.isMustChangePassword() && !ALLOWED_PATHS.contains(request.getRequestURI())) {
                response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                response.setContentType(MediaType.APPLICATION_JSON_VALUE);
                response.getWriter().write(
                        "{\"detail\":\"You must change your password before continuing.\",\"must_change_password\":true}");
                return;
            }
        }
        filterChain.doFilter(request, response);
    }
}
