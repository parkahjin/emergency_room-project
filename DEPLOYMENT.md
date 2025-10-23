# 응급실 혼잡도 예측 서비스 - 배포 가이드

## 📋 목차
1. [프로젝트 개요](#프로젝트-개요)
2. [프로젝트 구조](#프로젝트-구조)
3. [기술 스택](#기술-스택)
4. [로컬 개발 환경](#로컬-개발-환경)
5. [AWS Lightsail 배포](#aws-lightsail-배포)
6. [환경 변수 설정](#환경-변수-설정)
7. [트러블슈팅](#트러블슈팅)

---

## 프로젝트 개요

부산 지역 46개 응급실의 혼잡도를 실시간으로 예측하고 제공하는 웹 서비스입니다.

**주요 기능:**
- 실시간 응급실 혼잡도 예측 (여유/보통/혼잡)
- 카카오 지도 기반 병원 위치 표시
- 사용자 위치 기반 거리 및 소요시간 계산
- 24시간 혼잡도 예측 그래프
- 병원별 상세 정보 조회

**데이터:**
- 병원 수: 46개
- 예측 데이터: 24시간 × 46개 = 1,104개 레코드
- 머신러닝 모델: Random Forest (정확도 86.3%)

---

## 프로젝트 구조

```
emergency_room/
│
├── backend/                          # Spring Boot 백엔드
│   └── Hospitals/
│       ├── src/
│       │   ├── main/
│       │   │   ├── java/com/project/emergency/
│       │   │   │   ├── EmergencyApplication.java   # 메인 애플리케이션
│       │   │   │   ├── common/                     # 공통 클래스
│       │   │   │   │   └── ApiResponse.java        # API 응답 래퍼
│       │   │   │   ├── config/                     # 설정
│       │   │   │   │   └── WebConfig.java          # CORS 설정
│       │   │   │   ├── controller/                 # REST API 컨트롤러
│       │   │   │   │   ├── HospitalController.java    # 병원 API (6개)
│       │   │   │   │   ├── PredictionController.java  # 예측 API (6개)
│       │   │   │   │   └── KakaoController.java       # 카카오 API (4개)
│       │   │   │   ├── entity/                     # JPA 엔티티
│       │   │   │   │   ├── Hospital.java           # 병원 엔티티
│       │   │   │   │   └── Prediction.java         # 예측 엔티티
│       │   │   │   ├── repository/                 # JPA 레포지토리
│       │   │   │   │   ├── HospitalRepository.java
│       │   │   │   │   └── PredictionRepository.java
│       │   │   │   └── service/                    # 비즈니스 로직
│       │   │   │       ├── HospitalService.java
│       │   │   │       ├── PredictionService.java
│       │   │   │       └── KakaoApiService.java
│       │   │   └── resources/
│       │   │       ├── application.properties      # 애플리케이션 설정
│       │   │       └── application.properties.example
│       │   └── test/                               # 테스트 코드
│       ├── build.gradle                            # Gradle 빌드 설정
│       └── gradlew                                 # Gradle Wrapper
│
├── frontend/                         # React 프론트엔드
│   ├── public/
│   │   ├── index.html
│   │   └── kakaomap.html                          # 카카오 맵 테스트 페이지
│   ├── src/
│   │   ├── components/                            # React 컴포넌트
│   │   │   ├── Header.js                         # 헤더 (검색, 시간선택)
│   │   │   ├── MapSection.js                     # 카카오 지도
│   │   │   ├── Sidebar.js                        # 병원 목록 사이드바
│   │   │   ├── HospitalCard.js                   # 병원 카드
│   │   │   └── Modal.js                          # 병원 상세 모달
│   │   ├── services/
│   │   │   └── api.js                            # Axios API 클라이언트
│   │   ├── styles/                               # CSS 스타일
│   │   │   └── App.css
│   │   ├── App.js                                # 메인 앱 컴포넌트
│   │   └── index.js                              # React 진입점
│   ├── package.json                              # npm 의존성
│   └── build/                                    # 프로덕션 빌드 (배포용)
│
├── data-analysis/                    # 데이터 분석 및 ML
│   ├── data/
│   │   ├── processed/                            # 처리된 데이터
│   │   └── simulated/                            # 시뮬레이션 데이터
│   └── notebooks/                                # Jupyter 노트북
│       ├── 01_data_collection.ipynb              # 데이터 수집
│       ├── 02_import_to_mysql.ipynb             # MySQL 임포트
│       ├── 04_insert_predictions.ipynb           # 예측 데이터 삽입
│       └── 05_ml_training.ipynb                  # ML 모델 학습
│
├── CLAUDE.md                         # 프로젝트 가이드 (Claude Code용)
├── DEPLOYMENT.md                     # 이 파일
├── .gitignore
└── README.md/                        # 프로젝트 문서
    └── 응급실 혼잡도 예측 슬라이드.md
```

---

## 기술 스택

### 백엔드
- **Language**: Java 21
- **Framework**: Spring Boot 3.5.6
- **Database**: MySQL 8.0
- **ORM**: Hibernate (Spring Data JPA)
- **Build Tool**: Gradle 8.14.3

### 프론트엔드
- **Framework**: React 19.1.1
- **HTTP Client**: Axios 1.12.2
- **Map API**: Kakao Maps JavaScript API v3
- **Charts**: Chart.js 4.5.1 + react-chartjs-2

### 데이터 분석
- **Language**: Python 3.13
- **ML Library**: scikit-learn
- **Data Processing**: pandas, numpy
- **Environment**: Jupyter Notebook

### 배포
- **Server**: AWS Lightsail (Ubuntu)
- **Web Server**: Nginx (정적 파일 서빙 + 리버스 프록시)
- **Process Manager**: systemd (백엔드)
- **SSL**: Self-Signed Certificate (개발용)

---

## 로컬 개발 환경

### 필수 요구사항
- Java 21 (JDK)
- Node.js 18+ & npm
- MySQL 8.0
- Git

### 1. 프로젝트 클론
```bash
git clone <repository-url>
cd emergency_room
```

### 2. MySQL 데이터베이스 설정
```sql
CREATE DATABASE emergency_room CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'emergency_user'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON emergency_room.* TO 'emergency_user'@'localhost';
FLUSH PRIVILEGES;
```

### 3. 백엔드 실행

#### 환경 변수 설정 (Windows PowerShell)
```powershell
$env:DB_HOST="localhost"
$env:DB_PORT="3306"
$env:DB_NAME="emergency_room"
$env:DB_USERNAME="emergency_user"
$env:DB_PASSWORD="your_password"
$env:KAKAO_REST_API_KEY="your_kakao_rest_api_key"
$env:KAKAO_JS_API_KEY="your_kakao_js_api_key"
```

#### 환경 변수 설정 (Linux/Mac)
```bash
export DB_HOST=localhost
export DB_PORT=3306
export DB_NAME=emergency_room
export DB_USERNAME=emergency_user
export DB_PASSWORD=your_password
export KAKAO_REST_API_KEY=your_kakao_rest_api_key
export KAKAO_JS_API_KEY=your_kakao_js_api_key
```

#### 백엔드 실행
```bash
cd backend/Hospitals
./gradlew bootRun
```

**접속:** http://localhost:8080

### 4. 프론트엔드 실행
```bash
cd frontend
npm install
npm start
```

**접속:** http://localhost:3000

---

## AWS Lightsail 배포

### 아키텍처
```
[사용자]
   ↓ HTTPS (443)
[Nginx]
   ├─→ / (정적 파일) → /home/ubuntu/emergency_room-project/frontend/build/
   └─→ /api/* (프록시) → http://localhost:8080/api/*
                              ↓
                        [Spring Boot (8080)]
                              ↓
                        [MySQL (3306)]
```

### 1. Lightsail 인스턴스 생성
- **OS**: Ubuntu 22.04 LTS
- **플랜**: 최소 2GB RAM 권장
- **방화벽**: 22 (SSH), 80 (HTTP), 443 (HTTPS), 8080 (백엔드) 포트 오픈

### 2. 서버 접속 및 기본 설정
```bash
ssh ubuntu@<lightsail-ip>
sudo apt update && sudo apt upgrade -y
```

### 3. Java 21 설치
```bash
sudo apt install openjdk-21-jdk -y
java -version
```

### 4. MySQL 설치 및 설정
```bash
sudo apt install mysql-server -y
sudo mysql_secure_installation

# MySQL 접속
sudo mysql

# 데이터베이스 및 사용자 생성
CREATE DATABASE emergency_room CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'emergency_user'@'localhost' IDENTIFIED BY 'strong_password_here';
GRANT ALL PRIVILEGES ON emergency_room.* TO 'emergency_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### 5. Node.js 및 npm 설치
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
node -v
npm -v
```

### 6. 프로젝트 배포

```bash
# 프로젝트 클론
cd ~
git clone <repository-url> emergency_room-project
cd emergency_room-project

# 백엔드 빌드
cd backend/Hospitals
chmod +x gradlew
./gradlew build -x test

# 프론트엔드 빌드
cd ../../frontend
npm install
npm run build
```

### 7. systemd 서비스 설정 (백엔드)

```bash
sudo nano /etc/systemd/system/emergency-room-backend.service
```

**내용:**
```ini
[Unit]
Description=Emergency Room Backend Service
After=network.target mysql.service

[Service]
Type=simple
User=ubuntu
WorkingDirectory=/home/ubuntu/emergency_room-project/backend/Hospitals
ExecStart=/usr/bin/java -jar /home/ubuntu/emergency_room-project/backend/Hospitals/build/libs/Hospitals-0.0.1-SNAPSHOT.jar
Restart=always
RestartSec=10

# 환경 변수
Environment="DB_HOST=localhost"
Environment="DB_PORT=3306"
Environment="DB_NAME=emergency_room"
Environment="DB_USERNAME=emergency_user"
Environment="DB_PASSWORD=your_db_password"
Environment="KAKAO_REST_API_KEY=your_kakao_rest_key"
Environment="KAKAO_JS_API_KEY=your_kakao_js_key"

[Install]
WantedBy=multi-user.target
```

**서비스 시작:**
```bash
sudo systemctl daemon-reload
sudo systemctl enable emergency-room-backend
sudo systemctl start emergency-room-backend
sudo systemctl status emergency-room-backend
```

### 8. Nginx 설치 및 설정

```bash
sudo apt install nginx -y
sudo nano /etc/nginx/sites-available/emergency-room
```

**내용:**
```nginx
server {
    listen 80;
    listen [::]:80;
    server_name 52.79.185.111;

    # HTTP to HTTPS redirect
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl;
    listen [::]:443 ssl;
    server_name 52.79.185.111;

    # SSL 인증서 (Self-Signed)
    ssl_certificate /etc/nginx/ssl/nginx-selfsigned.crt;
    ssl_certificate_key /etc/nginx/ssl/nginx-selfsigned.key;

    # React 정적 파일
    root /home/ubuntu/emergency_room-project/frontend/build;
    index index.html;

    # 프론트엔드 - React Router 지원
    location / {
        try_files $uri $uri/ /index.html;
    }

    # 백엔드 API 프록시
    location /api/ {
        proxy_pass http://localhost:8080/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # 정적 파일 캐싱
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

**Self-Signed SSL 인증서 생성:**
```bash
sudo mkdir -p /etc/nginx/ssl
sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout /etc/nginx/ssl/nginx-selfsigned.key \
  -out /etc/nginx/ssl/nginx-selfsigned.crt
```

**Nginx 활성화:**
```bash
sudo ln -s /etc/nginx/sites-available/emergency-room /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
sudo systemctl enable nginx
```

### 9. 방화벽 설정
```bash
sudo ufw allow 22/tcp      # SSH
sudo ufw allow 80/tcp      # HTTP
sudo ufw allow 443/tcp     # HTTPS
sudo ufw enable
```

### 10. 배포 확인
- 브라우저에서 `https://52.79.185.111/` 접속
- Self-Signed 인증서 경고 무시하고 진행
- 지도에 병원 마커와 사이드바에 병원 카드가 표시되는지 확인

---

## 환경 변수 설정

### 백엔드 환경 변수
| 변수명 | 설명 | 기본값 | 필수 |
|--------|------|--------|------|
| `DB_HOST` | MySQL 호스트 | localhost | ✓ |
| `DB_PORT` | MySQL 포트 | 3306 | ✓ |
| `DB_NAME` | 데이터베이스 이름 | emergency_room | ✓ |
| `DB_USERNAME` | DB 사용자명 | root | ✓ |
| `DB_PASSWORD` | DB 비밀번호 | 1234 | ✓ |
| `KAKAO_REST_API_KEY` | Kakao REST API 키 | - | ✓ |
| `KAKAO_JS_API_KEY` | Kakao JavaScript 키 | - | ✓ |

### 카카오 API 키 발급
1. [Kakao Developers](https://developers.kakao.com) 접속
2. 애플리케이션 생성
3. **내 애플리케이션 > 앱 키**에서 REST API 키, JavaScript 키 확인
4. **플랫폼 설정**에서 웹 사이트 도메인 등록:
   - 로컬: `http://localhost:3000`
   - 배포: `https://52.79.185.111`

---

## 트러블슈팅

### 1. 백엔드가 시작되지 않음
```bash
# 로그 확인
sudo journalctl -u emergency-room-backend -f

# 포트 확인
sudo netstat -tuln | grep 8080

# Java 프로세스 확인
ps aux | grep java
```

### 2. 프론트엔드에서 API 호출 실패
- **증상**: 브라우저 콘솔에 CORS 에러
- **해결**:
  - 백엔드 `WebConfig.java`에서 CORS 설정 확인
  - `allowedOrigins`에 `https://52.79.185.111` 추가 확인
  - 백엔드 재시작: `sudo systemctl restart emergency-room-backend`

### 3. 카카오 지도가 표시되지 않음
- **원인**: Kakao JavaScript 키 미등록 또는 도메인 불일치
- **해결**:
  1. Kakao Developers에서 웹 플랫폼 도메인 등록 확인
  2. `index.html`에 올바른 JavaScript 키 사용 확인
  3. 브라우저 개발자 도구 콘솔에서 에러 메시지 확인

### 4. 병원 데이터가 표시되지 않음
```bash
# MySQL 데이터 확인
mysql -u emergency_user -p emergency_room

SELECT COUNT(*) FROM hospitals;        # 46개 확인
SELECT COUNT(*) FROM emergency_predictions;  # 1104개 확인
```

### 5. Nginx 502 Bad Gateway
- **원인**: 백엔드가 실행되지 않음
- **해결**:
```bash
sudo systemctl status emergency-room-backend
sudo systemctl start emergency-room-backend
```

### 6. 빌드 후 변경사항이 반영되지 않음
```bash
# 프론트엔드 재빌드
cd ~/emergency_room-project/frontend
rm -rf build
npm run build

# Nginx 캐시 클리어
sudo systemctl reload nginx

# 브라우저 캐시 강제 새로고침: Ctrl + Shift + R
```

---

## 업데이트 배포 프로세스

### 코드 변경 후 재배포

```bash
# 1. 서버 접속
ssh ubuntu@52.79.185.111

# 2. 최신 코드 가져오기
cd ~/emergency_room-project
git pull origin main

# 3. 백엔드 재빌드 및 재시작
cd backend/Hospitals
./gradlew build -x test
sudo systemctl restart emergency-room-backend

# 4. 프론트엔드 재빌드
cd ../../frontend
npm install  # 의존성 변경 시만
npm run build

# 5. Nginx 재시작
sudo systemctl reload nginx

# 6. 확인
sudo systemctl status emergency-room-backend
curl -I https://52.79.185.111
```

---

## 라이선스
이 프로젝트는 학습 및 포트폴리오 목적으로 제작되었습니다.

---

## 문의
프로젝트 관련 문의사항이 있으시면 GitHub Issues를 이용해주세요.
