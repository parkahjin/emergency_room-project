package com.project.emergency.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 병원 정보 엔티티
 */
@Entity
@Table(name = "hospitals")
public class Hospital {

    @Id
    @Column(name = "id", length = 10)
    private String id;

    @Column(name = "name", nullable = false, length = 100)
    private String name;

    @Column(name = "address", nullable = false, length = 200)
    private String address;

    @Column(name = "phone", nullable = false, length = 20)
    private String phone;

    @Column(name = "emergency_phone", length = 20)
    private String emergencyPhone;

    @Column(name = "latitude", nullable = false, precision = 10, scale = 8)
    private BigDecimal latitude;

    @Column(name = "longitude", nullable = false, precision = 11, scale = 8)
    private BigDecimal longitude;

    @Column(name = "district", nullable = false, length = 20)
    private String district;

    @Column(name = "emergency_level", nullable = false, length = 50)
    private String emergencyLevel;

    @Column(name = "hospital_type", nullable = false, length = 50)
    private String hospitalType;

    @Column(name = "beds_total")
    private Integer bedsTotal;

    @Column(name = "has_ct")
    private Boolean hasCt;

    @Column(name = "has_mri")
    private Boolean hasMri;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // ========================================
    // 생성자
    // ========================================
    public Hospital() {
    }

    // ========================================
    // Getter / Setter
    // ========================================
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getPhone() {
        return phone;
    }

    public Number getLatitude() {
        return latitude;
    }

    public Number getLongitude() {
        return longitude;
    }
}