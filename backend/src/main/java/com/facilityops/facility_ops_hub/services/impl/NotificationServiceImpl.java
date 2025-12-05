package com.facilityops.facility_ops_hub.services.impl;

import com.facilityops.facility_ops_hub.models.Notification;
import com.facilityops.facility_ops_hub.models.User;
import com.facilityops.facility_ops_hub.models.dto.NotificationDTO;
import com.facilityops.facility_ops_hub.repositories.NotificationRepository;
import com.facilityops.facility_ops_hub.services.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;
    private final SimpMessagingTemplate messagingTemplate;

    @Override
    public void notify(User user, String message) {

        Notification n = new Notification();
        n.setUser(user);
        n.setMessage(message);

        notificationRepository.save(n);

        messagingTemplate.convertAndSend(
                "/topic/notifications/" + user.getId(),
                message
        );
    }

    @Override
    public List<NotificationDTO> getNotifications(User user) {

        return notificationRepository.findByUserOrderByTimestampDesc(user)
                .stream()
                .map(n -> {
                    NotificationDTO dto = new NotificationDTO();
                    dto.setId(n.getId());
                    dto.setMessage(n.getMessage());
                    dto.setReadStatus(n.isReadStatus());
                    dto.setTimestamp(n.getTimestamp());
                    return dto;
                })
                .toList();
    }

    @Override
    public void markAsRead(Long notificationId, User user) {

        Notification n = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found"));

        if (!n.getUser().getId().equals(user.getId()))
            throw new RuntimeException("Not allowed");

        n.setReadStatus(true);
        notificationRepository.save(n);
    }

    @Override
    public long getUnreadCount(User user) {
        return notificationRepository.countByUserAndReadStatusFalse(user);
    }

    @Override
    public void markAllAsRead(User user) {
        List<Notification> list = notificationRepository.findByUserOrderByTimestampDesc(user);
        list.forEach(n -> n.setReadStatus(true));

        notificationRepository.saveAll(list);

        // After marking everything read, send unread = 0
        messagingTemplate.convertAndSend("/topic/notifications/" + user.getId() + "/count", "0");
    }
}