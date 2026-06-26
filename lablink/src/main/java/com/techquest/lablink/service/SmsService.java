package com.techquest.lablink.service;

import com.techquest.lablink.config.TwilioConfig;
import com.twilio.Twilio;
import com.twilio.rest.api.v2010.account.Message;
import com.twilio.type.PhoneNumber;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;

@Service
@Slf4j
public class SmsService {

    private final TwilioConfig twilioConfig;
    private boolean initialized = false;

    public SmsService(TwilioConfig twilioConfig) {
        this.twilioConfig = twilioConfig;
    }

    @PostConstruct
    void init() {
        if (twilioConfig.isEnabled() && !twilioConfig.getAccountSid().isBlank() && !twilioConfig.getAuthToken().isBlank()) {
            Twilio.init(twilioConfig.getAccountSid(), twilioConfig.getAuthToken());
            initialized = true;
        } else {
            log.info("Twilio SMS is disabled (set TWILIO_ENABLED=true and credentials to enable).");
        }
    }

    public void sendSms(String toPhoneNumber, String body) {
        if (!initialized) {
            log.info("SMS disabled, skipping message to {}", toPhoneNumber);
            return;
        }
        try {
            Message.creator(
                    new PhoneNumber(toPhoneNumber),
                    new PhoneNumber(twilioConfig.getFromNumber()),
                    body
            ).create();
        } catch (Exception e) {
            log.warn("Failed to send SMS to {}: {}", toPhoneNumber, e.getMessage());
        }
    }
}
