package com.techquest.lablink.config;

import com.techquest.lablink.enums.*;
import com.techquest.lablink.model.*;
import com.techquest.lablink.repository.*;
import com.techquest.lablink.service.NotificationService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * Populates the dev database with a realistic demo dataset on startup. Idempotent: skipped
 * entirely if the marker seed account already exists, so it's safe across devtools restarts
 * and coexists with any pre-existing data (it never deletes anything).
 */
@Component
@Profile("dev")
@Slf4j
public class DataSeeder implements CommandLineRunner {

    private static final String SEED_PASSWORD = "Test@123";
    private static final String MARKER_EMAIL = "dr.johnson@lablink.demo";

    private final UserRepository userRepository;
    private final PatientRepository patientRepository;
    private final TriageRepository triageRepository;
    private final ConsultationRepository consultationRepository;
    private final LabResultRepository labResultRepository;
    private final NotificationService notificationService;
    private final PasswordEncoder passwordEncoder;

    public DataSeeder(UserRepository userRepository,
                       PatientRepository patientRepository,
                       TriageRepository triageRepository,
                       ConsultationRepository consultationRepository,
                       LabResultRepository labResultRepository,
                       NotificationService notificationService,
                       PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.patientRepository = patientRepository;
        this.triageRepository = triageRepository;
        this.consultationRepository = consultationRepository;
        this.labResultRepository = labResultRepository;
        this.notificationService = notificationService;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(String... args) {
        if (userRepository.existsByEmail(MARKER_EMAIL)) {
            log.info("Seed data already present, skipping.");
            return;
        }
        log.info("Seeding demo data...");

        User drJohnson  = staff("Sarah", "Johnson", MARKER_EMAIL, Role.DOCTOR);
        User drWilliams = staff("Michael", "Williams", "dr.williams@lablink.demo", Role.DOCTOR);
        User nurseDavis = staff("Emily", "Davis", "nurse.davis@lablink.demo", Role.NURSE);
        User nurseBrown = staff("James", "Brown", "nurse.brown@lablink.demo", Role.NURSE);
        User labWilson  = staff("Olivia", "Wilson", "lab.wilson@lablink.demo", Role.LAB_STAFF);
        User labMoore   = staff("Daniel", "Moore", "lab.moore@lablink.demo", Role.LAB_STAFF);
        staff("Grace", "Taylor", "reception.taylor@lablink.demo", Role.RECEPTIONIST);
        staff("Rebecca", "Otieno", "hospital.admin@lablink.demo", Role.HOSPITAL_ADMIN);

        Patient john  = patient("John", "Mwangi", "john.mwangi@lablink.demo", "+254712345601",
                LocalDate.of(1985, 3, 12), "M", "O+", "Penicillin", "Nairobi, Kenya");
        Patient mary  = patient("Mary", "Achieng", "mary.achieng@lablink.demo", "+254712345602",
                LocalDate.of(1990, 7, 22), "F", "A+", null, "Kisumu, Kenya");
        Patient peter = patient("Peter", "Otieno", "peter.otieno@lablink.demo", "+254712345603",
                LocalDate.of(1978, 11, 5), "M", "B+", null, "Mombasa, Kenya");
        Patient grace = patient("Grace", "Wanjiru", "grace.wanjiru@lablink.demo", "+254712345604",
                LocalDate.of(1995, 1, 30), "F", "AB+", null, "Nakuru, Kenya");
        Patient samuel = patient("Samuel", "Kimani", null, "+254712345605",
                LocalDate.of(1982, 9, 18), "M", "O-", null, "Eldoret, Kenya");
        Patient lucy  = patient("Lucy", "Nyambura", "lucy.nyambura@lablink.demo", "+254712345606",
                LocalDate.of(1999, 4, 25), "F", "A-", null, "Thika, Kenya");

        triage(john, nurseDavis, "37.2", "120/80", 78, 16, "75.5", "175",
                "Persistent headache", "Mild nausea, sensitivity to light", UrgencyLevel.MEDIUM);
        triage(mary, nurseBrown, "38.9", "130/85", 95, 20, "62", "162",
                "Fever and chills", "Body aches, fatigue", UrgencyLevel.HIGH);
        triage(peter, nurseDavis, "36.8", "145/95", 88, 18, "88", "178",
                "Chest pain", "Shortness of breath on exertion", UrgencyLevel.CRITICAL);
        triage(grace, nurseBrown, "37.0", "118/76", 72, 14, "58", "165",
                "Routine checkup", null, UrgencyLevel.LOW);

        labResult(john, labWilson, TestType.FULL_BLOOD_COUNT, "Full Blood Count",
                "WBC 7.2, RBC 4.8, Hb 14.1, Platelets 250", ResultStatus.AVAILABLE);
        labResult(john, labMoore, TestType.MALARIA, "Malaria Test", null, ResultStatus.PENDING);
        labResult(mary, labWilson, TestType.BLOOD_TEST, "Complete Blood Count",
                "Normal range across all markers", ResultStatus.REVIEWED);
        labResult(peter, labMoore, TestType.CHOLESTEROL, "Lipid Panel", null, ResultStatus.PROCESSING);
        labResult(samuel, labWilson, TestType.HIV, "HIV Screening", "Non-reactive", ResultStatus.AVAILABLE);
        labResult(lucy, labMoore, TestType.GLUCOSE, "Fasting Glucose", null, ResultStatus.PENDING);

        consultation(john, drJohnson, "Persistent headache for 3 days",
                "No prior history of migraines", "Alert, no neurological deficits",
                "Tension headache, likely stress-related", DiagnosisType.PROVISIONAL,
                "Rest, hydration, OTC analgesics as needed", null, null, LocalDate.now().plusDays(7));
        consultation(peter, drWilliams, "Chest pain and shortness of breath",
                "Hypertensive, no prior cardiac events", "BP elevated, mild tachycardia",
                "Hypertension, rule out cardiac involvement", DiagnosisType.REFERRED,
                "Refer to cardiologist; start antihypertensive", null, "ECG, Lipid panel",
                LocalDate.now().plusDays(3));

        queue(grace, 1, QueueStatus.WAITING);
        queue(mary, 2, QueueStatus.CALLED);
        queue(peter, 3, QueueStatus.DONE);

        log.info("Seed data created: 7 staff, 6 patients, 4 triage records, 6 lab results, 2 consultations, 3 queued today.");
    }

    private User staff(String firstName, String lastName, String email, Role role) {
        User user = new User();
        user.setFirstName(firstName);
        user.setLastName(lastName);
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(SEED_PASSWORD));
        user.setRole(role);
        user.setActive(true);
        user.setMustChangePassword(false);
        user.setEmailVerified(true);
        return userRepository.save(user);
    }

    private Patient patient(String firstName, String lastName, String email, String phone,
                             LocalDate dob, String gender, String bloodGroup, String allergies, String address) {
        User user = new User();
        user.setFirstName(firstName);
        user.setLastName(lastName);
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(SEED_PASSWORD));
        user.setRole(Role.PATIENT);
        user.setActive(true);
        user.setMustChangePassword(false);
        user.setEmailVerified(email != null);
        User savedUser = userRepository.save(user);

        Patient patient = new Patient();
        patient.setUser(savedUser);
        patient.setPhone(phone);
        patient.setDateOfBirth(dob);
        patient.setGender(gender);
        patient.setBloodGroup(bloodGroup);
        patient.setAllergies(allergies);
        patient.setAddress(address);
        return patientRepository.save(patient);
    }

    private void triage(Patient patient, User nurse, String temperature, String bloodPressure,
                         int pulseRate, int respiratoryRate, String weight, String height,
                         String chiefComplaint, String symptoms, UrgencyLevel urgency) {
        TriageRecord record = new TriageRecord();
        record.setPatient(patient);
        record.setNurse(nurse);
        record.setTemperature(new BigDecimal(temperature));
        record.setBloodPressure(bloodPressure);
        record.setPulseRate(pulseRate);
        record.setRespiratoryRate(respiratoryRate);
        record.setWeight(new BigDecimal(weight));
        record.setHeight(new BigDecimal(height));
        record.setChiefComplaint(chiefComplaint);
        record.setSymptoms(symptoms);
        record.setUrgencyLevel(urgency);
        triageRepository.save(record);
    }

    private void labResult(Patient patient, User uploadedBy, TestType testType, String testName,
                            String resultDetails, ResultStatus status) {
        LabResult result = new LabResult();
        result.setPatient(patient);
        result.setUploadedBy(uploadedBy);
        result.setTestType(testType);
        result.setTestName(testName);
        result.setResultDetails(resultDetails);
        result.setStatus(status);
        result.setTestDate(LocalDate.now());
        LabResult saved = labResultRepository.save(result);

        if (status == ResultStatus.AVAILABLE) {
            notificationService.sendResultNotification(saved);
        }
    }

    private void consultation(Patient patient, User doctor, String chiefComplaint, String historyOfIllness,
                               String physicalExamination, String diagnosis, DiagnosisType diagnosisType,
                               String treatmentPlan, String prescriptions, String labTestsOrdered,
                               LocalDate followUpDate) {
        Consultation consultation = new Consultation();
        consultation.setPatient(patient);
        consultation.setDoctor(doctor);
        consultation.setChiefComplaint(chiefComplaint);
        consultation.setHistoryOfIllness(historyOfIllness);
        consultation.setPhysicalExamination(physicalExamination);
        consultation.setDiagnosis(diagnosis);
        consultation.setDiagnosisType(diagnosisType);
        consultation.setTreatmentPlan(treatmentPlan);
        consultation.setPrescriptions(prescriptions);
        consultation.setLabTestsOrdered(labTestsOrdered);
        consultation.setFollowUpDate(followUpDate);
        consultationRepository.save(consultation);
    }

    private void queue(Patient patient, int queueNumber, QueueStatus status) {
        patient.setQueueNumber(queueNumber);
        patient.setQueueStatus(status);
        patient.setQueueDate(LocalDate.now());
        patientRepository.save(patient);
    }
}
