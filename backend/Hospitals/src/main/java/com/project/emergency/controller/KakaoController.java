package com.project.emergency.controller;

import com.project.emergency.common.ApiResponse;
import com.project.emergency.service.KakaoApiService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * 카카오 API 연동 컨트롤러
 * - 길찾기(모빌리티)
 * - 주소 검색
 * - 좌표 변환
 */
@RestController
@RequestMapping("/api/kakao")
@CrossOrigin(origins = {"https://52.79.185.111", "http://localhost:3000"})
public class KakaoController {

    private final KakaoApiService kakaoApiService;

    @Autowired
    public KakaoController(KakaoApiService kakaoApiService) {
        this.kakaoApiService = kakaoApiService;
    }

    /**
     * 길찾기 정보 조회 (자동차 기준)
     * GET /api/kakao/directions
     *
     * @param originLat 출발지 위도
     * @param originLng 출발지 경도
     * @param destLat 목적지 위도
     * @param destLng 목적지 경도
     */
    @GetMapping("/directions")
    public ApiResponse<?> getDirections(
            @RequestParam Double originLat,
            @RequestParam Double originLng,
            @RequestParam Double destLat,
            @RequestParam Double destLng
    ) {
        System.out.println("카카오 길찾기 API 호출");
        System.out.println("출발: " + originLat + ", " + originLng);
        System.out.println("도착: " + destLat + ", " + destLng);

        try {
            Map<String, Object> result = kakaoApiService.getDirections(
                    originLat, originLng, destLat, destLng
            );
            return ApiResponse.success("경로 조회 성공", result);
        } catch (Exception e) {
            System.err.println("경로 조회 실패: " + e.getMessage());
            return ApiResponse.error("경로 조회 중 오류가 발생했습니다");
        }
    }

    /**
     * 병원까지의 경로 정보 조회
     * GET /api/kakao/hospital-route/{hospitalId}
     *
     * @param hospitalId 병원 ID
     * @param userLat 사용자 위도
     * @param userLng 사용자 경도
     */
    @GetMapping("/hospital-route/{hospitalId}")
    public ApiResponse<?> getHospitalRoute(
            @PathVariable String hospitalId,
            @RequestParam Double userLat,
            @RequestParam Double userLng
    ) {
        System.out.println("병원 경로 조회 - 병원ID: " + hospitalId);

        try {
            Map<String, Object> result = kakaoApiService.getHospitalRoute(
                    hospitalId, userLat, userLng
            );
            return ApiResponse.success("병원 경로 조회 성공", result);
        } catch (Exception e) {
            System.err.println("병원 경로 조회 실패: " + e.getMessage());
            return ApiResponse.error("병원 경로 조회 중 오류가 발생했습니다");
        }
    }

    /**
     * 주소 검색
     * GET /api/kakao/search/address
     *
     * @param query 검색할 주소
     */
    @GetMapping("/search/address")
    public ApiResponse<?> searchAddress(@RequestParam String query) {
        System.out.println("카카오 주소 검색: " + query);

        try {
            Map<String, Object> result = kakaoApiService.searchAddress(query);
            return ApiResponse.success("주소 검색 성공", result);
        } catch (Exception e) {
            System.err.println("주소 검색 실패: " + e.getMessage());
            return ApiResponse.error("주소 검색 중 오류가 발생했습니다");
        }
    }

    /**
     * 좌표를 주소로 변환
     * GET /api/kakao/coord2address
     *
     * @param lat 위도
     * @param lng 경도
     */
    @GetMapping("/coord2address")
    public ApiResponse<?> coordToAddress(
            @RequestParam Double lat,
            @RequestParam Double lng
    ) {
        System.out.println("좌표→주소 변환: " + lat + ", " + lng);

        try {
            Map<String, Object> result = kakaoApiService.coordToAddress(lat, lng);
            return ApiResponse.success("주소 변환 성공", result);
        } catch (Exception e) {
            System.err.println("주소 변환 실패: " + e.getMessage());
            return ApiResponse.error("주소 변환 중 오류가 발생했습니다");
        }
    }
}