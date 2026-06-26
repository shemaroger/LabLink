package com.techquest.lablink.model;

import com.techquest.lablink.enums.QueueStatus;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "patients")
@Getter
@Setter
@NoArgsConstructor
public class Patient {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(name = "date_of_birth")
    private LocalDate dateOfBirth;

    private String gender;

    private String phone;

    private String address;

    @Column(name = "blood_group")
    private String bloodGroup;

    private String allergies;

    @Column(name = "emergency_contact_name")
    private String emergencyContactName;

    @Column(name = "emergency_contact_phone")
    private String emergencyContactPhone;

    @Column(name = "insurance_provider")
    private String insuranceProvider;

    @Column(name = "insurance_card_number")
    private String insuranceCardNumber;

    @Column(name = "queue_number")
    private Integer queueNumber;

    @Enumerated(EnumType.STRING)
    @Column(name = "queue_status")
    private QueueStatus queueStatus;

    @Column(name = "queue_date")
    private LocalDate queueDate;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        createdAt = now;
        updatedAt = now;
    }

    @PreUpdate
    void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public boolean isQueuedToday() {
        return queueDate != null && queueDate.equals(LocalDate.now());
    }
}
