package com.project.emergency.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * 혼잡도 예측 엔티티
 * emergency_predictions 테이블과 매핑
 */
@Entity
@Table(name = "emergency_predictions")
public class Prediction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "hospital_id", length = 10)
    private String hospitalId;

    @Column(name = "prediction_hour")
    private Integer predictionHour;

    @Column(name = "predicted_wait_time")
    private Integer predictedWaitTime;

    @Column(name = "congestion_level", length = 10)
    private String congestionLevel;

    @Column(name = "congestion_color", length = 10)
    private String congestionColor;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    // ========================================
    // 생성자
    // ========================================
    public Prediction() {
    }

    // ========================================
    // Getter / Setter
    // ========================================
    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getHospitalId() {
        return hospitalId;
    }

    public void setHospitalId(String hospitalId) {
        this.hospitalId = hospitalId;
    }

    public Integer getPredictionHour() {
        return predictionHour;
    }

    public void setPredictionHour(Integer predictionHour) {
        this.predictionHour = predictionHour;
    }

    public Integer getPredictedWaitTime() {
        return predictedWaitTime;
    }

    public void setPredictedWaitTime(Integer predictedWaitTime) {
        this.predictedWaitTime = predictedWaitTime;
    }

    public String getCongestionLevel() {
        return congestionLevel;
    }

    public void setCongestionLevel(String congestionLevel) {
        this.congestionLevel = congestionLevel;
    }

    public String getCongestionColor() {
        return congestionColor;
    }

    public void setCongestionColor(String congestionColor) {
        this.congestionColor = congestionColor;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}