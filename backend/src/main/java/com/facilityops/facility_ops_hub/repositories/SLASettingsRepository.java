package com.facilityops.facility_ops_hub.repositories;

import com.facilityops.facility_ops_hub.models.SLASettings;
import com.facilityops.facility_ops_hub.models.enums.Priority;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface SLASettingsRepository extends JpaRepository<SLASettings, Long> {

    Optional<SLASettings> findByPriority(Priority priority);
}
