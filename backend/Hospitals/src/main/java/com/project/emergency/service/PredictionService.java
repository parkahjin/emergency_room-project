package com.project.emergency.service;

import com.project.emergency.entity.Prediction;
import com.project.emergency.repository.PredictionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 혼잡도 예측 서비스
 */
@Service
@Transactional(readOnly = true)
public class PredictionService {

    private final PredictionRepository predictionRepository;

    public PredictionService(PredictionRepository predictionRepository) {
        this.predictionRepository = predictionRepository;
    }

    /**
     * 특정 병원의 현재 시간 혼잡도 예측 조회
     */
    public Prediction getCurrentPrediction(String hospitalId) {
        int currentHour = LocalDateTime.now().getHour();
        System.out.println("현재 시간: " + currentHour + "시");

        return predictionRepository
                .findByHospitalIdAndPredictionHour(hospitalId, currentHour)
                .orElseThrow(() -> new RuntimeException(
                        "예측 데이터를 찾을 수 없습니다. 병원ID: " + hospitalId + ", 시간: " + currentHour
                ));
    }

    /**
     * 특정 병원의 특정 시간 혼잡도 예측 조회
     */
    public Prediction getPredictionByHour(String hospitalId, Integer hour) {
        if (hour < 0 || hour > 23) {
            throw new IllegalArgumentException("시간은 0~23 사이여야 합니다.");
        }

        return predictionRepository
                .findByHospitalIdAndPredictionHour(hospitalId, hour)
                .orElseThrow(() -> new RuntimeException(
                        "예측 데이터를 찾을 수 없습니다. 병원ID: " + hospitalId + ", 시간: " + hour
                ));
    }

    /**
     * 특정 병원의 24시간 예측 데이터 조회
     */
    public List<Prediction> getAllPredictionsForHospital(String hospitalId) {
        System.out.println("병원 24시간 예측 조회: " + hospitalId);
        List<Prediction> predictions = predictionRepository
                .findByHospitalIdOrderByPredictionHourAsc(hospitalId);

        if (predictions.isEmpty()) {
            throw new RuntimeException("예측 데이터를 찾을 수 없습니다. 병원ID: " + hospitalId);
        }

        System.out.println("조회된 예측 수: " + predictions.size());
        return predictions;
    }

    /**
     * 현재 시간의 모든 병원 혼잡도 조회
     */
    public List<Prediction> getAllCurrentPredictions() {
        int currentHour = LocalDateTime.now().getHour();
        System.out.println("현재 시간 모든 병원 혼잡도 조회: " + currentHour + "시");

        List<Prediction> predictions = predictionRepository.findByPredictionHour(currentHour);
        System.out.println("조회된 병원 수: " + predictions.size());

        return predictions;
    }

    /**
     * 특정 혼잡도 레벨의 병원 조회
     */
    public List<Prediction> getPredictionsByLevel(String level) {
        if (!level.equals("여유") && !level.equals("보통") && !level.equals("혼잡")) {
            throw new IllegalArgumentException("혼잡도 레벨은 '여유', '보통', '혼잡' 중 하나여야 합니다.");
        }

        return predictionRepository.findByCongestionLevel(level);
    }
}