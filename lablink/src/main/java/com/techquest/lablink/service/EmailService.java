package com.techquest.lablink.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;
    private final boolean mailEnabled;

    public EmailService(JavaMailSender mailSender, @Value("${app.mail.enabled}") boolean mailEnabled) {
        this.mailSender = mailSender;
        this.mailEnabled = mailEnabled;
    }

    public void sendWelcomeEmail(String toEmail, String firstName, String temporaryPassword) {
        String subject = "Welcome to LabLink";
        String body = "Hi " + firstName + ",\n\n"
                + "An account has been created for you on LabLink.\n"
                + "Email: " + toEmail + "\n"
                + "Temporary password: " + temporaryPassword + "\n\n"
                + "You will be required to change this password on first login.";

        if (!mailEnabled) {
            log.info("Mail disabled, skipping welcome email to {}", toEmail);
            return;
        }

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(toEmail);
            message.setSubject(subject);
            message.setText(body);
            mailSender.send(message);
        } catch (Exception e) {
            log.warn("Failed to send welcome email to {}: {}", toEmail, e.getMessage());
        }
    }

    public void sendNotificationEmail(String toEmail, String subject, String body) {
        if (!mailEnabled) {
            log.info("Mail disabled, skipping notification email to {}", toEmail);
            return;
        }
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(toEmail);
            message.setSubject(subject);
            message.setText(body);
            mailSender.send(message);
        } catch (Exception e) {
            log.warn("Failed to send notification email to {}: {}", toEmail, e.getMessage());
        }
    }
}
