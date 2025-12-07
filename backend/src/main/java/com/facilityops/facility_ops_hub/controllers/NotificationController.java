package com.facilityops.facility_ops_hub.controllers;

import com.facilityops.facility_ops_hub.models.User;
import com.facilityops.facility_ops_hub.models.dto.NotificationDTO;
import com.facilityops.facility_ops_hub.services.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
@CrossOrigin("*")
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping
    public List<NotificationDTO> getMyNotifications(@AuthenticationPrincipal User user) {
        return notificationService.getNotifications(user);
    }

    @PutMapping("/{id}/read")
    public String markAsRead(@PathVariable Long id,
                             @AuthenticationPrincipal User user) {
        notificationService.markAsRead(id, user);
        return "Notification marked as read";
    }

    @GetMapping("/unread-count")
    public long getUnreadCount(@AuthenticationPrincipal User user) {
        return notificationService.getUnreadCount(user);
    }

    @PutMapping("/read-all")
    public String markAllAsRead(@AuthenticationPrincipal User user) {
        notificationService.markAllAsRead(user);
        return "All notifications marked as read";
    }
}
