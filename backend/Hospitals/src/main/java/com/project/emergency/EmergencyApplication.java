package com.project.emergency;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * 응급실 혼잡도 예측 서비스
 * Spring Boot 애플리케이션 시작점
 */
@SpringBootApplication
public class EmergencyApplication {

    public static void main(String[] args) {
        SpringApplication.run(EmergencyApplication.class, args);

        System.out.println("========================================");
        System.out.println("응급실 혼잡도 예측 서비스 시작!");
        System.out.println("서버 주소: http://localhost:8080");
        System.out.println("========================================");
    }
}