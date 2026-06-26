package com.techquest.lablink.repository;

import com.techquest.lablink.model.Patient;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface PatientRepository extends JpaRepository<Patient, Long>, JpaSpecificationExecutor<Patient> {

    Optional<Patient> findByUserId(Long userId);

    Optional<Patient> findByUserEmail(String email);

    Optional<Patient> findByPhone(String phone);

    @Query("select p from Patient p where p.queueDate = :date order by p.queueNumber asc")
    List<Patient> findTodayQueue(@Param("date") LocalDate date);

    @Query("select coalesce(max(p.queueNumber), 0) from Patient p where p.queueDate = :date")
    Integer findMaxQueueNumberForDate(@Param("date") LocalDate date);

    @Query("select count(p) from Patient p where p.queueDate = :date and p.queueNumber < :queueNumber "
            + "and p.queueStatus <> com.techquest.lablink.enums.QueueStatus.DONE")
    long countAheadInQueue(@Param("date") LocalDate date, @Param("queueNumber") int queueNumber);

    @Query("select p from Patient p where p.queueDate = :date and p.queueStatus = "
            + "com.techquest.lablink.enums.QueueStatus.WAITING order by p.queueNumber asc")
    List<Patient> findWaitingInQueue(@Param("date") LocalDate date);
}
