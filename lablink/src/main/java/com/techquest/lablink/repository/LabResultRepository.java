package com.techquest.lablink.repository;

import com.techquest.lablink.model.LabResult;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.List;

public interface LabResultRepository extends JpaRepository<LabResult, Long>, JpaSpecificationExecutor<LabResult> {

    List<LabResult> findByPatientIdOrderByTestDateDesc(Long patientId);
}
