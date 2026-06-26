package com.techquest.lablink.repository;

import com.techquest.lablink.model.AuditLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface AuditLogRepository extends JpaRepository<AuditLog, Long>, JpaSpecificationExecutor<AuditLog> {

    List<AuditLog> findByUserIdOrderByTimestampDesc(Long userId);

    long countByTimestampAfter(LocalDateTime since);

    @Query("select a.action, count(a) from AuditLog a group by a.action order by count(a) desc")
    List<Object[]> countGroupedByAction();

    @Query("select a.user.id, a.user.email, count(a) from AuditLog a where a.user is not null group by a.user.id, a.user.email order by count(a) desc")
    List<Object[]> countGroupedByUser();
}
