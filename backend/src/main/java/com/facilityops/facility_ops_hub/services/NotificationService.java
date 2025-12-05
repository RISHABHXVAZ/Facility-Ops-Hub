package com.facilityops.facility_ops_hub.services;

import com.facilityops.facility_ops_hub.models.User;
import com.facilityops.facility_ops_hub.models.Notification;
import com.facilityops.facility_ops_hub.models.dto.NotificationDTO;

import java.util.List;

public interface NotificationService {

    void notify(User user, String message);

    List<NotificationDTO> getNotifications(User user);

    void markAsRead(Long notificationId, User user);
}
