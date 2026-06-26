package com.techquest.lablink.repository;

import com.techquest.lablink.model.TriageRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.List;

public interface TriageRepository extends JpaRepository<TriageRecord, Long>, JpaSpecificationExecutor<TriageRecord> {

    List<TriageRecord> findByPatientIdOrderByCreatedAtDesc(Long patientId);
}
