package com.project.emergency.repository;

import com.project.emergency.entity.Hospital;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

/**
 * 병원 정보 Repository (JPA)
 * JpaRepository가 기본 CRUD 자동 제공
 */
@Repository
public interface HospitalRepository extends JpaRepository<Hospital, String> {

    /**
     * 구별 병원 조회
     * WHERE district = ?
     */
    List<Hospital> findByDistrict(String district);

    /**
     * 병원명 검색 (부분 일치)
     * WHERE name LIKE %?%
     */
    List<Hospital> findByNameContaining(String name);

    /**
     * 응급실 등급별 조회
     * WHERE emergency_level = ?
     */
    List<Hospital> findByEmergencyLevel(String emergencyLevel);

    /**
     * 이름순 정렬 조회
     * ORDER BY name ASC
     */
    List<Hospital> findAllByOrderByNameAsc();
}