# 응급실 혼잡도 예측 서비스 - 프로젝트 전체 문서

> **작성일**: 2025-10-20
> **목적**: AWS Lightsail 배포를 위한 프로젝트 전체 현황 문서

---

## 📋 목차
1. [프로젝트 개요](#프로젝트-개요)
2. [기술 스택](#기술-스택)
3. [프로젝트 구조](#프로젝트-구조)
4. [Backend 상세](#backend-상세)
5. [Frontend 상세](#frontend-상세)
6. [데이터베이스](#데이터베이스)
7. [API 엔드포인트](#api-엔드포인트)
8. [주요 기능](#주요-기능)
9. [보안 이슈 및 주의사항](#보안-이슈-및-주의사항)
10. [최근 변경사항](#최근-변경사항)
11. [배포 가이드](#배포-가이드)
12. [환경 변수 설정](#환경-변수-설정)

---

## 프로젝트 개요

### 서비스 설명
부산 지역 응급실의 **실시간 혼잡도를 ML 기반으로 예측**하고, 사용자 위치를 기반으로 **최적의 병원을 추천**하는 풀스택 웹 애플리케이션

### 핵심 기능
- ✅ **GPS 기반 사용자 위치 추적** (모바일 최적화)
- ✅ **ML 기반 24시간 혼잡도 예측** (시간대별 조회 가능)
- ✅ **Kakao Maps 연동** (병원 위치 시각화 + 마커 클러스터링)
- ✅ **Kakao Mobility API** (실시간 경로 및 소요시간)
- ✅ **2단계 거리 계산** (Haversine + Kakao API)
- ✅ **반응형 디자인** (모바일/태블릿/PC 대응)

### 타겟 사용자
- 응급 상황 시 빠른 병원 선택이 필요한 일반인
- 모바일 환경에서 사용 (PC 환경은 부차적)

---

## 기술 스택

### Backend
- **Framework**: Spring Boot 3.5.6
- **Language**: Java 21
- **ORM**: JPA (Hibernate)
- **Database**: MySQL (개발) / PostgreSQL 마이그레이션 예정
- **Build Tool**: Gradle 8.5
- **Container**: Docker (multi-stage build)

### Frontend
- **Framework**: React 19.1.1
- **Language**: JavaScript (ES6+)
- **HTTP Client**: Axios
- **Maps**: Kakao Maps JavaScript API
- **Charts**: Chart.js + react-chartjs-2
- **Build Tool**: React Scripts 5.0.1

### Data Analysis
- **Environment**: Jupyter Notebook
- **Language**: Python 3.x
- **ML Libraries**: scikit-learn (추정)
- **Data**: CSV 기반 병원 정보 + 시뮬레이션 데이터

### External APIs
- **Kakao Maps API** (지도 표시)
- **Kakao Mobility API** (경로 탐색)
- **Kakao Local API** (주소 검색, 좌표 변환)

---

## 프로젝트 구조

```
emergency_room/
├── backend/
│   └── Hospitals/
│       ├── src/
│       │   ├── main/
│       │   │   ├── java/com/project/emergency/
│       │   │   │   ├── common/
│       │   │   │   │   └── ApiResponse.java          # API 응답 래퍼
│       │   │   │   ├── config/
│       │   │   │   │   └── WebConfig.java            # CORS 설정
│       │   │   │   ├── controller/
│       │   │   │   │   ├── HospitalController.java   # 병원 API
│       │   │   │   │   ├── PredictionController.java # 혼잡도 API
│       │   │   │   │   └── KakaoController.java      # 카카오 API
│       │   │   │   ├── entity/
│       │   │   │   │   ├── Hospital.java             # 병원 엔티티
│       │   │   │   │   └── Prediction.java           # 예측 엔티티
│       │   │   │   ├── repository/
│       │   │   │   │   ├── HospitalRepository.java
│       │   │   │   │   └── PredictionRepository.java
│       │   │   │   ├── service/
│       │   │   │   │   ├── HospitalService.java
│       │   │   │   │   ├── PredictionService.java
│       │   │   │   │   └── KakaoApiService.java
│       │   │   │   └── EmergencyApplication.java     # 메인 클래스
│       │   │   └── resources/
│       │   │       └── application.properties         # ⚠️ 보안 주의
│       │   └── test/
│       ├── build.gradle
│       └── Dockerfile
│
├── frontend/
│   ├── public/
│   │   └── index.html                                # Kakao Maps SDK 로드
│   ├── src/
│   │   ├── components/
│   │   │   ├── Header.js                             # 검색/시간선택
│   │   │   ├── MapSection.js                         # 카카오맵 + 클러스터링
│   │   │   ├── Sidebar.js                            # 병원 목록
│   │   │   ├── HospitalCard.js                       # 병원 카드
│   │   │   └── Modal.js                              # 병원 상세정보
│   │   ├── services/
│   │   │   └── api.js                                # Axios API 함수
│   │   ├── styles/
│   │   │   └── App.css                               # 반응형 CSS
│   │   ├── App.js                                    # 메인 컴포넌트
│   │   └── index.js
│   └── package.json
│
├── data-analysis/
│   ├── notebooks/
│   │   ├── 01_data_collection.ipynb                  # 병원 데이터 수집
│   │   ├── 02_import_to_mysql.ipynb                  # MySQL 초기 임포트
│   │   ├── 03_old_simulation.ipynb                   # 구 시뮬레이션
│   │   ├── 04_insert_predictions.ipynb               # 예측 데이터 삽입
│   │   └── 05_ml_training.ipynb                      # ML 모델 학습
│   └── data/
│       ├── raw/
│       │   └── busan_hospitals_static.csv
│       └── simulated/
│           ├── emergency_predictions_simulation.csv
│           └── ml_emergency_predictions.csv
│
├── .gitignore                                        # ⚠️ application.properties 추가 필요
├── CLAUDE.md                                         # Claude Code 가이드
└── README.md
```

---

## Backend 상세

### 계층 구조 (Layered Architecture)

```
Controller Layer → Service Layer → Repository Layer → Database
     ↓                  ↓                 ↓
  REST API         비즈니스 로직       JPA 쿼리
```

### 주요 Entity

#### 1. Hospital (병원)
```java
@Entity
@Table(name = "hospitals")
public class Hospital {
    @Id
    @Column(name = "id", length = 10)
    private String id;  // 예: "ER001"

    private String name;
    private String address;
    private String phone;
    private String emergencyPhone;

    @Column(precision = 10, scale = 8)
    private BigDecimal latitude;

    @Column(precision = 11, scale = 8)
    private BigDecimal longitude;

    private String district;           // 구/군 (예: "부산진구")
    private String emergencyLevel;     // 응급실 등급
    private String hospitalType;       // 병원 유형
    private Integer bedsTotal;         // 총 병상 수
    private Boolean hasCt;             // CT 보유 여부
    private Boolean hasMri;            // MRI 보유 여부

    // ⚠️ 주의: getLatitude(), getLongitude()가 Number 타입 반환
}
```

#### 2. Prediction (혼잡도 예측)
```java
@Entity
@Table(name = "emergency_predictions")
public class Prediction {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    private String hospitalId;              // ⚠️ JPA 관계 없음 (수동 조인)
    private Integer predictionHour;         // 0-23
    private Integer predictedWaitTime;      // 분 단위
    private String congestionLevel;         // "여유"/"보통"/"혼잡"
    private String congestionColor;         // UI 표시용

    private LocalDateTime createdAt;
}
```

### 주요 Service 로직

#### HospitalService
- **Haversine 거리 계산** (62-75행)
  ```java
  private double calculateDistance(double lat1, double lon1, double lat2, double lon2) {
      final int EARTH_RADIUS = 6371; // km
      // 구면 삼각법으로 직선거리 계산
      return EARTH_RADIUS * c;
  }
  ```

#### KakaoApiService
- **카카오 모빌리티 API 호출** (40-101행)
  - 경로 정보: distance(m), duration(초), taxiFare
  - RestTemplate 사용
  - JSON 파싱: ObjectMapper

---

## Frontend 상세

### 상태 관리 (App.js)

**모든 상태를 App.js에서 중앙 관리** (Redux 미사용)

```javascript
const [hospitals, setHospitals] = useState([]);        // 병원 데이터
const [userLocation, setUserLocation] = useState({     // GPS 위치
  lat: 35.1796,
  lng: 129.0756
});
const [locationName, setLocationName] = useState('');  // 주소명
const [selectedHour, setSelectedHour] = useState(new Date().getHours());
const [sortBy, setSortBy] = useState('distance');
const [loading, setLoading] = useState(true);
```

### 컴포넌트 계층 구조

```
App (상태 관리)
├── Header (검색, 시간 선택, 위치 표시)
├── MapSection (Kakao Maps + 마커 클러스터링)
├── Sidebar (병원 목록 + 정렬)
└── Modal (병원 상세정보 팝업)
```

### 핵심 데이터 흐름

#### 1. 초기 데이터 로딩
```javascript
fetchHospitalsData() {
  1. 병원 목록 + 현재 혼잡도 병렬 로드 (Promise.all)
  2. Haversine으로 전체 병원 직선거리 계산
  3. 거리순 정렬
  4. 상위 10개만 카카오 API로 실제 경로 조회 ⭐
  5. 혼잡도 색상 매핑 (green/yellow/red/gray)
  6. 상태 업데이트
}
```

#### 2. GPS 위치 추적 (최근 수정됨)
```javascript
getCurrentLocation() {
  navigator.geolocation.getCurrentPosition(
    (position) => {
      // GPS 성공 → 정확한 위치
      setUserLocation({
        lat: position.coords.latitude,
        lng: position.coords.longitude
      });
    },
    (error) => {
      // GPS 실패 → 양정역 폴백
      setUserLocation({ lat: 35.1697, lng: 129.0704 });
    },
    {
      enableHighAccuracy: true,  // ⭐ GPS 정확도 향상
      timeout: 10000,
      maximumAge: 0
    }
  );
}
```

### 카카오맵 마커 클러스터링

**MapSection.js**
```javascript
const markerClusterer = new window.kakao.maps.MarkerClusterer({
  map: kakaoMap,
  averageCenter: true,
  minLevel: 5,  // 레벨 5 이상에서 클러스터링
  disableClickZoom: false
});

// 혼잡도별 마커 색상
- 여유(green): #48bb78
- 보통(yellow): #ed8936
- 혼잡(red): #f56565
- 정보없음(gray): #a0aec0
```

### 반응형 CSS

**App.css**
```css
/* 태블릿 (1200px 이하) */
@media (max-width: 1200px) {
  .main-content { flex-direction: column; }
  .map-section { height: 50vh; }
}

/* 모바일 (768px 이하) */
@media (max-width: 768px) {
  .header { flex-direction: column; }
  .search-input { width: 200px; }
  .modal { width: 95%; }
}
```

---

## 데이터베이스

### 현재 상태
- **개발 환경**: MySQL
- **마이그레이션 예정**: PostgreSQL

### 테이블 구조

#### hospitals
```sql
CREATE TABLE hospitals (
  id VARCHAR(10) PRIMARY KEY,           -- 예: "ER001"
  name VARCHAR(100) NOT NULL,
  address VARCHAR(200) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  emergency_phone VARCHAR(20),
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  district VARCHAR(20) NOT NULL,        -- 부산 16개 구/군
  emergency_level VARCHAR(50) NOT NULL,
  hospital_type VARCHAR(50) NOT NULL,
  beds_total INT,
  has_ct BOOLEAN,
  has_mri BOOLEAN,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

#### emergency_predictions
```sql
CREATE TABLE emergency_predictions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  hospital_id VARCHAR(10),               -- ⚠️ FK 제약 없음
  prediction_hour INT,                   -- 0-23
  predicted_wait_time INT,               -- 분 단위
  congestion_level VARCHAR(10),          -- "여유"/"보통"/"혼잡"
  congestion_color VARCHAR(10),
  created_at TIMESTAMP
);
```

### 데이터 특성
- **병원 수**: 약 50-100개 (부산 지역)
- **예측 데이터**: 각 병원당 24개 레코드 (시간대별)
- **총 예측 레코드**: 병원 수 × 24

---

## API 엔드포인트

### Base URL
```
http://localhost:8080/api
```

### Hospital API

| Method | Endpoint | 설명 | CORS |
|--------|----------|------|------|
| GET | `/hospitals` | 전체 병원 목록 | localhost:3000 |
| GET | `/hospitals/{id}` | 병원 상세 | localhost:3000 |
| GET | `/hospitals/district/{district}` | 구별 병원 조회 | localhost:3000 |
| GET | `/hospitals/search?keyword=X` | 병원 검색 | localhost:3000 |
| POST | `/hospitals/nearby` | 근처 병원 | localhost:3000 |
| GET | `/hospitals/count` | 병원 개수 | localhost:3000 |

**Request Body (nearby)**
```json
{
  "latitude": 35.1697,
  "longitude": 129.0704,
  "limit": 10
}
```

### Prediction API

| Method | Endpoint | 설명 | CORS |
|--------|----------|------|------|
| GET | `/predictions/{hospitalId}/current` | 현재 혼잡도 | ⚠️ * |
| GET | `/predictions/{hospitalId}/all` | 24시간 예측 | ⚠️ * |
| GET | `/predictions/{hospitalId}/hour/{hour}` | 특정 시간 예측 | ⚠️ * |
| GET | `/predictions/current/all` | 전체 현재 혼잡도 | ⚠️ * |
| GET | `/predictions/hour/{hour}/all` | 특정 시간 전체 | ⚠️ * |
| GET | `/predictions/level/{level}` | 혼잡도별 필터 | ⚠️ * |

### Kakao API

| Method | Endpoint | 설명 | CORS |
|--------|----------|------|------|
| GET | `/kakao/directions` | 경로 조회 | localhost:3000 |
| GET | `/kakao/hospital-route/{hospitalId}` | 병원 경로 | localhost:3000 |
| GET | `/kakao/search/address?query=X` | 주소 검색 | localhost:3000 |
| GET | `/kakao/coord2address?lat=X&lng=Y` | 좌표→주소 | localhost:3000 |

### 공통 응답 형식

**성공**
```json
{
  "status": "success",
  "message": "조회 성공",
  "data": { ... }
}
```

**실패**
```json
{
  "status": "error",
  "message": "오류 메시지",
  "data": null
}
```

---

## 주요 기능

### 1. GPS 기반 위치 추적
- `enableHighAccuracy: true` 옵션으로 GPS 정확도 향상
- 모바일 환경에서 정확한 위치 획득
- 권한 거부 시 양정역(35.1697, 129.0704)으로 폴백

### 2. 2단계 거리 계산 최적화
```
1단계: Haversine 공식 (전체 병원)
  → 직선거리 계산 (빠름, API 호출 없음)
  → 거리순 정렬

2단계: Kakao Mobility API (상위 10개만)
  → 실제 도로 거리 + 소요시간
  → API 호출 최소화 (요금 절감)
```

### 3. 시간대별 혼잡도 조회
- 슬라이더로 0-23시 선택
- 각 병원당 24시간 예측 데이터 보유
- 시간 변경 시 자동 리로드

### 4. 마커 클러스터링
- 줌 레벨 5 이상에서 자동 그룹화
- 클러스터 클릭 시 확대
- 혼잡도별 색상 구분

### 5. 반응형 디자인
- 모바일: 세로 레이아웃 (지도 50% + 목록 50%)
- 태블릿: 세로/가로 전환
- PC: 가로 레이아웃 (지도 66% + 목록 33%)

---

## 보안 이슈 및 주의사항

### 🔴 Critical - 즉시 조치 필수

#### 1. Kakao API 키 노출
**위치**: `backend/Hospitals/src/main/resources/application.properties:33-34`

```properties
# ⚠️ 현재 하드코딩되어 있음 (보안 위험!)
kakao.api.rest.key=2e952875c8a650360548a7ca3dba733a
kakao.api.js.key=5f6fa1c4e15fd383aafcab97713d1a7c
```

**위험성**:
- Git 히스토리에 영구 기록됨
- 공개 저장소 시 누구나 열람 가능
- 무단 사용으로 요금 폭탄 가능

**해결 방법**:
```bash
# 1. Kakao Developers에서 키 즉시 재발급
# 2. 환경변수로 이관
export KAKAO_REST_API_KEY="새로운키"
export KAKAO_JS_API_KEY="새로운키"

# 3. application.properties 수정
kakao.api.rest.key=${KAKAO_REST_API_KEY}
kakao.api.js.key=${KAKAO_JS_API_KEY}

# 4. .gitignore에 추가
echo "application.properties" >> .gitignore
echo "application-*.properties" >> .gitignore
```

#### 2. CORS 와일드카드 설정
**위치**: `PredictionController.java:15`

```java
@CrossOrigin(origins = "*")  // ⚠️ 모든 도메인 허용
```

**해결 방법**:
```java
// 개발 환경
@CrossOrigin(origins = "http://localhost:3000")

// 프로덕션 환경
@CrossOrigin(origins = "https://yourdomain.com")
```

### 🟡 High - 단기 조치 권장

#### 3. 데이터베이스 자격증명
**위치**: `application.properties:10-12`

```properties
spring.datasource.username=root       # ⚠️ root 계정 사용
spring.datasource.password=1234       # ⚠️ 약한 비밀번호
```

**해결 방법**:
```bash
# 전용 계정 생성
CREATE USER 'emergency_user'@'localhost' IDENTIFIED BY '강력한비밀번호';
GRANT SELECT, INSERT, UPDATE ON emergency_room.* TO 'emergency_user'@'localhost';

# 환경변수로 이관
spring.datasource.username=${DB_USERNAME}
spring.datasource.password=${DB_PASSWORD}
```

### 🟢 Medium - 개선 권장

4. **Rate Limiting 부재** → API 호출 제한 없음
5. **에러 메시지 정보 노출** → 내부 데이터 구조 노출
6. **HTTPS 미사용** → 프로덕션 배포 시 SSL 인증서 필수
7. **입력 값 검증 부족** → `@Valid`, `@Pattern` 추가 권장

---

## 최근 변경사항

### 2025-10-20: GPS 기반 위치 추적 활성화

**파일**: `frontend/src/App.js (36-76행)`

**변경 내용**:
```javascript
// BEFORE: 양정역 하드코딩
const newLocation = { lat: 35.1697, lng: 129.0704 };

// AFTER: GPS 활성화
navigator.geolocation.getCurrentPosition(
  (position) => { /* GPS 성공 */ },
  (error) => { /* 양정역 폴백 */ },
  {
    enableHighAccuracy: true,  // ⭐ 추가
    timeout: 10000,
    maximumAge: 0
  }
);
```

**효과**:
- ✅ 모바일에서 정확한 GPS 위치 획득
- ✅ PC에서 WiFi 기반 위치 시도
- ✅ 실패 시 양정역 자동 폴백 (개발 환경 대응)

---

## 배포 가이드

### 사전 준비

#### 1. 환경변수 설정
```bash
# Backend (AWS Lightsail 인스턴스)
export DB_HOST="localhost"
export DB_PORT="3306"
export DB_NAME="emergency_room"
export DB_USERNAME="emergency_user"
export DB_PASSWORD="강력한비밀번호"
export KAKAO_REST_API_KEY="재발급받은키"
export KAKAO_JS_API_KEY="재발급받은키"

# Frontend (빌드 시)
export REACT_APP_API_BASE_URL="http://your-server-ip:8080/api"
export REACT_APP_KAKAO_JS_KEY="재발급받은키"
```

#### 2. 데이터베이스 설정

**MySQL 설치 및 설정**
```bash
# MySQL 설치
sudo apt update
sudo apt install mysql-server

# 데이터베이스 생성
mysql -u root -p
CREATE DATABASE emergency_room CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# 사용자 생성
CREATE USER 'emergency_user'@'localhost' IDENTIFIED BY '강력한비밀번호';
GRANT ALL PRIVILEGES ON emergency_room.* TO 'emergency_user'@'localhost';
FLUSH PRIVILEGES;
```

**데이터 임포트**
```bash
# 병원 데이터 임포트
mysql -u emergency_user -p emergency_room < hospitals.sql

# 예측 데이터 임포트
mysql -u emergency_user -p emergency_room < predictions.sql
```

### Backend 배포 (Spring Boot)

#### 방법 1: JAR 파일 직접 실행
```bash
# 1. 빌드
cd backend/Hospitals
./gradlew clean build

# 2. JAR 파일 서버로 전송
scp build/libs/*.jar user@server:/home/user/emergency-backend/

# 3. 서버에서 실행
java -jar emergency-backend.jar \
  --spring.datasource.url=jdbc:mysql://localhost:3306/emergency_room \
  --spring.datasource.username=$DB_USERNAME \
  --spring.datasource.password=$DB_PASSWORD \
  --kakao.api.rest.key=$KAKAO_REST_API_KEY
```

#### 방법 2: Docker 사용
```bash
# 1. Docker 이미지 빌드
cd backend/Hospitals
docker build -t emergency-backend .

# 2. 컨테이너 실행
docker run -d \
  --name emergency-backend \
  -p 8080:8080 \
  -e DB_HOST=host.docker.internal \
  -e DB_USERNAME=$DB_USERNAME \
  -e DB_PASSWORD=$DB_PASSWORD \
  -e KAKAO_REST_API_KEY=$KAKAO_REST_API_KEY \
  emergency-backend
```

#### 방법 3: systemd 서비스 등록
```bash
# /etc/systemd/system/emergency-backend.service
[Unit]
Description=Emergency Room Backend
After=network.target

[Service]
Type=simple
User=ubuntu
WorkingDirectory=/home/ubuntu/emergency-backend
ExecStart=/usr/bin/java -jar /home/ubuntu/emergency-backend/app.jar
Restart=always
Environment="DB_USERNAME=emergency_user"
Environment="DB_PASSWORD=강력한비밀번호"
Environment="KAKAO_REST_API_KEY=재발급받은키"

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl daemon-reload
sudo systemctl start emergency-backend
sudo systemctl enable emergency-backend
```

### Frontend 배포 (React)

#### 방법 1: 정적 파일 호스팅 (Nginx)
```bash
# 1. 빌드
cd frontend
npm install
npm run build

# 2. Nginx 설정
# /etc/nginx/sites-available/emergency-frontend
server {
    listen 80;
    server_name your-domain.com;
    root /var/www/emergency-frontend;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# 3. Nginx 활성화
sudo ln -s /etc/nginx/sites-available/emergency-frontend /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### 방법 2: AWS S3 + CloudFront (정적 호스팅)
```bash
# 1. S3 버킷 생성 및 업로드
aws s3 mb s3://emergency-frontend
aws s3 sync build/ s3://emergency-frontend --acl public-read

# 2. CloudFront 배포 생성 (콘솔에서)
```

### SSL 인증서 설정 (Let's Encrypt)
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
sudo certbot renew --dry-run
```

### 방화벽 설정
```bash
# Lightsail 콘솔에서 설정
- HTTP (80)
- HTTPS (443)
- Custom TCP (8080) - Backend API
- MySQL (3306) - 로컬만 허용
```

---

## 환경 변수 설정

### Backend (application.properties)

**개발 환경** (application-dev.properties)
```properties
# Server
server.port=8080

# Database
spring.datasource.url=jdbc:mysql://localhost:3306/emergency_room
spring.datasource.username=${DB_USERNAME}
spring.datasource.password=${DB_PASSWORD}
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver

# JPA
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.format_sql=true
spring.jpa.database-platform=org.hibernate.dialect.MySQL8Dialect

# Kakao API
kakao.api.rest.key=${KAKAO_REST_API_KEY}
kakao.api.js.key=${KAKAO_JS_API_KEY}

# Logging
logging.level.org.hibernate.SQL=DEBUG
logging.level.com.project.emergency=INFO
```

**프로덕션 환경** (application-prod.properties)
```properties
# Server
server.port=${PORT:8080}

# Database (PostgreSQL 마이그레이션 시)
spring.datasource.url=jdbc:${DATABASE_URL}
spring.datasource.username=${DB_USERNAME}
spring.datasource.password=${DB_PASSWORD}

# JPA
spring.jpa.hibernate.ddl-auto=validate
spring.jpa.show-sql=false

# Kakao API
kakao.api.rest.key=${KAKAO_REST_API_KEY}
kakao.api.js.key=${KAKAO_JS_API_KEY}

# Logging
logging.level.org.hibernate.SQL=WARN
logging.level.com.project.emergency=INFO
```

### Frontend (.env)

**개발 환경** (.env.development)
```env
REACT_APP_API_BASE_URL=http://localhost:8080/api
REACT_APP_KAKAO_JS_KEY=5f6fa1c4e15fd383aafcab97713d1a7c
```

**프로덕션 환경** (.env.production)
```env
REACT_APP_API_BASE_URL=https://your-domain.com/api
REACT_APP_KAKAO_JS_KEY=재발급받은키
```

---

## 추가 참고사항

### 알려진 이슈

1. **Hospital Entity getter 타입 불일치**
   - `getLatitude()`, `getLongitude()`가 `Number` 타입 반환
   - `BigDecimal` 예상하지만 실제로는 작동함

2. **JPA 관계 누락**
   - Hospital ↔ Prediction 간 FK 관계 없음
   - Service Layer에서 수동 조인 처리

3. **Test 패키지 명명 불일치**
   - `com.example.demo` vs `com.project.emergency`
   - 테스트 코드 업데이트 필요

### 성능 최적화 팁

1. **카카오 API 호출 최소화**
   - 현재: 상위 10개만 호출 (완료)
   - 추가: Redis 캐싱 검토

2. **데이터베이스 인덱스**
   ```sql
   CREATE INDEX idx_hospital_district ON hospitals(district);
   CREATE INDEX idx_prediction_hour ON emergency_predictions(hospital_id, prediction_hour);
   ```

3. **Spring Boot 캐싱**
   ```java
   @EnableCaching
   @Cacheable("hospitals")
   public List<Hospital> findAllHospitals() { ... }
   ```

### 모니터링 추천

- **Backend**: Spring Boot Actuator + Prometheus
- **Frontend**: Google Analytics / Vercel Analytics
- **Database**: MySQL Workbench / pgAdmin
- **Logging**: ELK Stack (Elasticsearch + Logstash + Kibana)

---

## 문의 및 지원

- **Claude Code 가이드**: `CLAUDE.md` 참고
- **프로젝트 문서**: 본 문서 (`PROJECT_SUMMARY.md`)
- **API 문서**: Swagger/OpenAPI 추가 권장

---

**마지막 업데이트**: 2025-10-20
**버전**: 1.0.0
**작성자**: Claude Code Analysis
