package com.project.emergency.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.project.emergency.entity.Hospital;
import com.project.emergency.repository.HospitalRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 카카오 API 서비스
 * 실제 카카오 REST API 호출 처리
 */
@Service
public class KakaoApiService {

    @Value("${kakao.api.rest.key}")
    private String kakaoRestKey;

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;
    private final HospitalRepository hospitalRepository;

    @Autowired
    public KakaoApiService(HospitalRepository hospitalRepository) {
        this.restTemplate = new RestTemplate();
        this.objectMapper = new ObjectMapper();
        this.hospitalRepository = hospitalRepository;
    }

    /**
     * 길찾기 API - 자동차 경로
     */
    public Map<String, Object> getDirections(
            Double originLat, Double originLng,
            Double destLat, Double destLng
    ) throws Exception {

        String url = String.format(
                "https://apis-navi.kakaomobility.com/v1/directions?" +
                        "origin=%f,%f&destination=%f,%f&priority=RECOMMEND",
                originLng, originLat, destLng, destLat
        );

        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "KakaoAK " + kakaoRestKey);

        HttpEntity<String> entity = new HttpEntity<>(headers);

        try {
            ResponseEntity<String> response = restTemplate.exchange(
                    url, HttpMethod.GET, entity, String.class
            );

            Map<String, Object> responseBody = objectMapper.readValue(
                    response.getBody(), Map.class
            );

            // 첫 번째 경로 정보 추출
            List<Map<String, Object>> routes =
                    (List<Map<String, Object>>) responseBody.get("routes");

            if (routes != null && !routes.isEmpty()) {
                Map<String, Object> route = routes.get(0);
                Map<String, Object> summary =
                        (Map<String, Object>) route.get("summary");

                // 필요한 정보만 추출
                Map<String, Object> result = new HashMap<>();
                result.put("distance", summary.get("distance")); // 미터
                result.put("duration", summary.get("duration")); // 초

                // 택시 요금이 있으면 추가
                Map<String, Object> fare =
                        (Map<String, Object>) summary.get("fare");
                if (fare != null && fare.containsKey("taxi")) {
                    result.put("taxiFare", fare.get("taxi"));
                }

                // km와 분 단위로 변환한 값도 추가
                result.put("distanceKm",
                        Math.round((Integer)summary.get("distance") / 100.0) / 10.0);
                result.put("durationMin",
                        Math.ceil((Integer)summary.get("duration") / 60.0));

                return result;
            }

            throw new RuntimeException("경로를 찾을 수 없습니다");

        } catch (Exception e) {
            System.err.println("카카오 API 호출 실패: " + e.getMessage());
            throw new Exception("경로 조회 실패: " + e.getMessage());
        }
    }

    /**
     * 병원까지의 경로 조회
     */
    public Map<String, Object> getHospitalRoute(
            String hospitalId, Double userLat, Double userLng
    ) throws Exception {

        // 병원 정보 조회
        Hospital hospital = hospitalRepository.findById(hospitalId)
                .orElseThrow(() -> new RuntimeException("병원을 찾을 수 없습니다"));

        // 경로 조회 - Number 타입을 Double로 변환
        Map<String, Object> routeInfo = getDirections(
                userLat, userLng,
                hospital.getLatitude().doubleValue(),
                hospital.getLongitude().doubleValue()
        );

        // 병원 정보 추가
        routeInfo.put("hospitalName", hospital.getName());
        routeInfo.put("hospitalAddress", hospital.getAddress());

        return routeInfo;
    }

    /**
     * 주소 검색 API
     */
    public Map<String, Object> searchAddress(String query) throws Exception {

        String url = "https://dapi.kakao.com/v2/local/search/address.json?query="
                + query;

        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "KakaoAK " + kakaoRestKey);

        HttpEntity<String> entity = new HttpEntity<>(headers);

        try {
            ResponseEntity<String> response = restTemplate.exchange(
                    url, HttpMethod.GET, entity, String.class
            );

            return objectMapper.readValue(response.getBody(), Map.class);

        } catch (Exception e) {
            System.err.println("주소 검색 실패: " + e.getMessage());
            throw new Exception("주소 검색 실패");
        }
    }

    /**
     * 좌표를 주소로 변환
     */
    public Map<String, Object> coordToAddress(Double lat, Double lng)
            throws Exception {

        String url = String.format(
                "https://dapi.kakao.com/v2/local/geo/coord2address.json?x=%f&y=%f",
                lng, lat
        );

        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "KakaoAK " + kakaoRestKey);

        HttpEntity<String> entity = new HttpEntity<>(headers);

        try {
            ResponseEntity<String> response = restTemplate.exchange(
                    url, HttpMethod.GET, entity, String.class
            );

            Map<String, Object> responseBody = objectMapper.readValue(
                    response.getBody(), Map.class
            );

            List<Map<String, Object>> documents =
                    (List<Map<String, Object>>) responseBody.get("documents");

            if (documents != null && !documents.isEmpty()) {
                Map<String, Object> result = new HashMap<>();
                Map<String, Object> address =
                        (Map<String, Object>) documents.get(0).get("address");

                if (address != null) {
                    result.put("address", address.get("address_name"));
                    result.put("region1", address.get("region_1depth_name"));
                    result.put("region2", address.get("region_2depth_name"));
                    result.put("region3", address.get("region_3depth_name"));
                }

                return result;
            }

            throw new RuntimeException("주소를 찾을 수 없습니다");

        } catch (Exception e) {
            System.err.println("좌표→주소 변환 실패: " + e.getMessage());
            throw new Exception("주소 변환 실패");
        }
    }
}