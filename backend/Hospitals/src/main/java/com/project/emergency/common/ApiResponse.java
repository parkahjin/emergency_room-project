package com.project.emergency.common;

/**
 * API 공통 응답 형식
 */
public class ApiResponse<T> {

    private String status;
    private String message;
    private T data;

    // ========================================
    // 기본 생성자
    // ========================================
    public ApiResponse() {
    }

    // ========================================
    // 전체 필드 생성자
    // ========================================
    public ApiResponse(String status, String message, T data) {
        this.status = status;
        this.message = message;
        this.data = data;
    }

    // ========================================
    // Getter / Setter
    // ========================================
    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public T getData() {
        return data;
    }

    public void setData(T data) {
        this.data = data;
    }

    // ========================================
    // 정적 팩토리 메서드 (간편 생성)
    // ========================================

    /**
     * 성공 응답 생성 (기본 메시지)
     */
    public static <T> ApiResponse<T> success(T data) {
        return new ApiResponse<>("success", "Success", data);
    }

    /**
     * 성공 응답 생성 (커스텀 메시지)
     */
    public static <T> ApiResponse<T> success(String message, T data) {
        return new ApiResponse<>("success", message, data);
    }

    /**
     * 실패 응답 생성
     */
    public static <T> ApiResponse<T> error(String message) {
        return new ApiResponse<>("error", message, null);
    }
}