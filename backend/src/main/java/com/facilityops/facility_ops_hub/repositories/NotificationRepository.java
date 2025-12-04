package com.facilityops.facility_ops_hub.repositories;

import com.facilityops.facility_ops_hub.models.Notification;
import com.facilityops.facility_ops_hub.models.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {

    List<Notification> findByRecipient(User user);

    List<Notification> findByRecipientAndIsReadFalse(User user);
}
