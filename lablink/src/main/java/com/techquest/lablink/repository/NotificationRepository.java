package com.techquest.lablink.repository;

import com.techquest.lablink.enums.DeliveryMethod;
import com.techquest.lablink.enums.NotificationStatus;
import com.techquest.lablink.model.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long>, JpaSpecificationExecutor<Notification> {

    List<Notification> findByPatientIdOrderByCreatedAtDesc(Long patientId);

    List<Notification> findByPatientIdAndStatusOrderByCreatedAtDesc(Long patientId, NotificationStatus status);

    long countByPatientIdAndDeliveryMethodAndStatusNot(Long patientId, DeliveryMethod deliveryMethod, NotificationStatus status);
}
