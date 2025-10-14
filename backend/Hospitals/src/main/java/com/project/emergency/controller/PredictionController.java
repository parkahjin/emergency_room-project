package com.project.emergency.controller;

import com.project.emergency.common.ApiResponse;
import com.project.emergency.entity.Prediction;
import com.project.emergency.service.PredictionService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 혼잡도 예측 REST API 컨트롤러
 */
@RestController
@RequestMapping("/api/predictions")
@CrossOrigin(origins = "*")
public class PredictionController {

    private final PredictionService predictionService;

    public PredictionController(PredictionService predictionService) {
        this.predictionService = predictionService;
    }

    /**
     * 특정 병원의 현재 시간 혼잡도 예측 조회
     * GET /api/predictions/{hospitalId}/current
     *
     * @param hospitalId 병원 ID (예: ER001)
     * @return 현재 시간 혼잡도 예측
     */
    @GetMapping("/{hospitalId}/current")
    public ApiResponse<Prediction> getCurrentPrediction(@PathVariable String hospitalId) {
        System.out.println("API 호출: 현재 혼잡도 조회 - 병원ID: " + hospitalId);

        try {
            Prediction prediction = predictionService.getCurrentPrediction(hospitalId);
            return ApiResponse.success("현재 혼잡도 조회 성공", prediction);
        } catch (RuntimeException e) {
            return ApiResponse.error(e.getMessage());
        }
    }

    /**
     * 특정 병원의 특정 시간 혼잡도 예측 조회
     * GET /api/predictions/{hospitalId}/hour/{hour}
     *
     * @param hospitalId 병원 ID
     * @param hour 시간 (0~23)
     * @return 해당 시간 혼잡도 예측
     */
    @GetMapping("/{hospitalId}/hour/{hour}")
    public ApiResponse<Prediction> getPredictionByHour(
            @PathVariable String hospitalId,
            @PathVariable Integer hour) {
        System.out.println("API 호출: 시간별 혼잡도 조회 - 병원: " + hospitalId + ", 시간: " + hour);

        try {
            Prediction prediction = predictionService.getPredictionByHour(hospitalId, hour);
            return ApiResponse.success("혼잡도 조회 성공", prediction);
        } catch (IllegalArgumentException e) {
            return ApiResponse.error(e.getMessage());
        } catch (RuntimeException e) {
            return ApiResponse.error(e.getMessage());
        }
    }

    /**
     * 특정 병원의 24시간 예측 데이터 조회
     * GET /api/predictions/{hospitalId}/all
     *
     * @param hospitalId 병원 ID
     * @return 24시간 예측 데이터 리스트
     */
    @GetMapping("/{hospitalId}/all")
    public ApiResponse<List<Prediction>> getAllPredictions(@PathVariable String hospitalId) {
        System.out.println("API 호출: 24시간 예측 조회 - 병원ID: " + hospitalId);

        try {
            List<Prediction> predictions = predictionService.getAllPredictionsForHospital(hospitalId);
            return ApiResponse.success(
                    "24시간 예측 조회 성공 (" + predictions.size() + "개)",
                    predictions
            );
        } catch (RuntimeException e) {
            return ApiResponse.error(e.getMessage());
        }
    }

    /**
     * 현재 시간의 모든 병원 혼잡도 조회
     * GET /api/predictions/current/all
     *
     * @return 모든 병원의 현재 혼잡도
     */
    @GetMapping("/current/all")
    public ApiResponse<List<Prediction>> getAllCurrentPredictions() {
        System.out.println("API 호출: 모든 병원 현재 혼잡도 조회");

        try {
            List<Prediction> predictions = predictionService.getAllCurrentPredictions();
            return ApiResponse.success(
                    "현재 시간 모든 병원 혼잡도 조회 성공 (" + predictions.size() + "개)",
                    predictions
            );
        } catch (Exception e) {
            return ApiResponse.error("혼잡도 조회 중 오류가 발생했습니다");
        }
    }

    /**
     * 특정 혼잡도 레벨의 병원 조회
     * GET /api/predictions/level/{level}
     *
     * @param level 혼잡도 레벨 (여유/보통/혼잡)
     * @return 해당 혼잡도 레벨의 병원 리스트
     */
    @GetMapping("/level/{level}")
    public ApiResponse<List<Prediction>> getPredictionsByLevel(@PathVariable String level) {
        System.out.println("API 호출: 혼잡도 레벨별 조회 - 레벨: " + level);

        try {
            List<Prediction> predictions = predictionService.getPredictionsByLevel(level);
            return ApiResponse.success(
                    level + " 병원 " + predictions.size() + "개 조회",
                    predictions
            );
        } catch (IllegalArgumentException e) {
            return ApiResponse.error(e.getMessage());
        } catch (Exception e) {
            return ApiResponse.error("혼잡도 조회 중 오류가 발생했습니다");
        }
    }
}