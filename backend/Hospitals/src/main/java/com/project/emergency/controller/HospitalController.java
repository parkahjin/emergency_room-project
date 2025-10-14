package com.project.emergency.controller;

import com.project.emergency.common.ApiResponse;
import com.project.emergency.entity.Hospital;
import com.project.emergency.service.HospitalService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 병원 정보 REST API 컨트롤러
 */
@RestController
@RequestMapping("/api/hospitals")
@CrossOrigin(origins = "http://localhost:3000")
public class HospitalController {

    private final HospitalService hospitalService;

    // 생성자 주입 (Lombok 없이)
    public HospitalController(HospitalService hospitalService) {
        this.hospitalService = hospitalService;
    }

    /**
     * 전체 병원 목록 조회
     * GET /api/hospitals
     */
    @GetMapping
    public ApiResponse<List<Hospital>> getAllHospitals() {
        System.out.println("API 호출: 전체 병원 목록 조회");

        try {
            List<Hospital> hospitals = hospitalService.findAllHospitals();
            return ApiResponse.success(
                    "병원 목록 조회 성공 (" + hospitals.size() + "개)",
                    hospitals
            );
        } catch (Exception e) {
            System.err.println("병원 목록 조회 실패: " + e.getMessage());
            return ApiResponse.error("병원 목록 조회 중 오류가 발생했습니다");
        }
    }

    /**
     * 특정 병원 상세 조회
     * GET /api/hospitals/{id}
     */
    @GetMapping("/{id}")
    public ApiResponse<Hospital> getHospitalById(@PathVariable String id) {
        System.out.println("API 호출: 병원 상세 조회 - ID: " + id);

        try {
            Hospital hospital = hospitalService.findHospitalById(id);
            return ApiResponse.success("병원 조회 성공", hospital);
        } catch (RuntimeException e) {
            return ApiResponse.error(e.getMessage());
        }
    }

    /**
     * 구별 병원 조회
     * GET /api/hospitals/district/{district}
     */
    @GetMapping("/district/{district}")
    public ApiResponse<List<Hospital>> getHospitalsByDistrict(@PathVariable String district) {
        System.out.println("API 호출: 구별 병원 조회 - 구: " + district);

        try {
            List<Hospital> hospitals = hospitalService.findHospitalsByDistrict(district);
            return ApiResponse.success(
                    district + "의 병원 " + hospitals.size() + "개 조회",
                    hospitals
            );
        } catch (Exception e) {
            return ApiResponse.error("병원 조회 중 오류가 발생했습니다");
        }
    }

    /**
     * 병원명 검색
     * GET /api/hospitals/search?keyword=부산
     */
    @GetMapping("/search")
    public ApiResponse<List<Hospital>> searchHospitals(@RequestParam String keyword) {
        System.out.println("API 호출: 병원 검색 - 키워드: " + keyword);

        try {
            List<Hospital> hospitals = hospitalService.searchHospitalsByName(keyword);
            return ApiResponse.success("검색 결과 " + hospitals.size() + "개", hospitals);
        } catch (Exception e) {
            return ApiResponse.error("병원 검색 중 오류가 발생했습니다");
        }
    }

    /**
     * 근처 병원 조회
     * POST /api/hospitals/nearby
     */
    @PostMapping("/nearby")
    public ApiResponse<List<Hospital>> getNearbyHospitals(@RequestBody NearbyRequest request) {
        System.out.println("API 호출: 근처 병원 조회");

        try {
            List<Hospital> hospitals = hospitalService.findNearbyHospitals(
                    request.latitude,
                    request.longitude,
                    request.limit
            );
            return ApiResponse.success("근처 병원 " + hospitals.size() + "개 조회", hospitals);
        } catch (Exception e) {
            return ApiResponse.error("근처 병원 조회 중 오류가 발생했습니다");
        }
    }

    /**
     * 병원 개수 조회
     * GET /api/hospitals/count
     */
    @GetMapping("/count")
    public ApiResponse<Long> getHospitalCount() {
        try {
            long count = hospitalService.countHospitals();
            return ApiResponse.success("병원 개수: " + count, count);
        } catch (Exception e) {
            return ApiResponse.error("개수 조회 중 오류가 발생했습니다");
        }
    }

    // 요청 DTO
    public static class NearbyRequest {
        public double latitude;
        public double longitude;
        public int limit = 10;
    }
}