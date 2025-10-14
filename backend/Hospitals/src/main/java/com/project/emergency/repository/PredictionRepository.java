package com.project.emergency.repository;

import com.project.emergency.entity.Prediction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

/**
 * 혼잡도 예측 Repository
 */
@Repository
public interface PredictionRepository extends JpaRepository<Prediction, Integer> {

    /**
     * 특정 병원의 특정 시간 예측 조회
     */
    Optional<Prediction> findByHospitalIdAndPredictionHour(String hospitalId, Integer predictionHour);

    /**
     * 특정 병원의 전체 예측 조회 (24시간)
     */
    List<Prediction> findByHospitalIdOrderByPredictionHourAsc(String hospitalId);

    /**
     * 특정 시간대의 모든 병원 예측 조회
     */
    List<Prediction> findByPredictionHour(Integer predictionHour);

    /**
     * 특정 혼잡도 레벨의 병원 조회
     */
    List<Prediction> findByCongestionLevel(String congestionLevel);
}