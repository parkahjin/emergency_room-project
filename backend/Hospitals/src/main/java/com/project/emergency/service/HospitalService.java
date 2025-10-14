package com.project.emergency.service;

import com.project.emergency.entity.Hospital;
import com.project.emergency.repository.HospitalRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * 병원 정보 서비스
 */
@Service
@Transactional(readOnly = true)
public class HospitalService {

    private final HospitalRepository hospitalRepository;

    // 생성자 주입
    public HospitalService(HospitalRepository hospitalRepository) {
        this.hospitalRepository = hospitalRepository;
    }

    public List<Hospital> findAllHospitals() {
        return hospitalRepository.findAllByOrderByNameAsc();
    }

    public Hospital findHospitalById(String id) {
        return hospitalRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("병원을 찾을 수 없습니다. ID: " + id));
    }

    public List<Hospital> findHospitalsByDistrict(String district) {
        return hospitalRepository.findByDistrict(district);
    }

    public List<Hospital> searchHospitalsByName(String keyword) {
        return hospitalRepository.findByNameContaining(keyword);
    }

    public long countHospitals() {
        return hospitalRepository.count();
    }

    public List<Hospital> findNearbyHospitals(double userLat, double userLon, int limit) {
        List<Hospital> allHospitals = hospitalRepository.findAll();

        return allHospitals.stream()
                .sorted((h1, h2) -> {
                    double dist1 = calculateDistance(userLat, userLon,
                            h1.getLatitude().doubleValue(),
                            h1.getLongitude().doubleValue());
                    double dist2 = calculateDistance(userLat, userLon,
                            h2.getLatitude().doubleValue(),
                            h2.getLongitude().doubleValue());
                    return Double.compare(dist1, dist2);
                })
                .limit(limit)
                .toList();
    }

    private double calculateDistance(double lat1, double lon1, double lat2, double lon2) {
        final int EARTH_RADIUS = 6371;

        double latDistance = Math.toRadians(lat2 - lat1);
        double lonDistance = Math.toRadians(lon2 - lon1);

        double a = Math.sin(latDistance / 2) * Math.sin(latDistance / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(lonDistance / 2) * Math.sin(lonDistance / 2);

        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return EARTH_RADIUS * c;
    }
}