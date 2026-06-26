package com.techquest.lablink.repository;

import com.techquest.lablink.model.Consultation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.List;

public interface ConsultationRepository extends JpaRepository<Consultation, Long>, JpaSpecificationExecutor<Consultation> {

    List<Consultation> findByPatientIdOrderByCreatedAtDesc(Long patientId);
}
