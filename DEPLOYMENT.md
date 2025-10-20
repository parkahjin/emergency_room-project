# AWS Lightsail 배포 가이드 (MySQL 버전)

Emergency Room 프로젝트를 AWS Lightsail에 MySQL 기반으로 배포하는 가이드입니다.

## 목차
- [사전 준비사항](#사전-준비사항)
- [1단계: Lightsail 인스턴스 생성](#1단계-lightsail-인스턴스-생성)
- [2단계: 서버 초기 설정](#2단계-서버-초기-설정)
- [3단계: MySQL 설치 및 데이터 임포트](#3단계-mysql-설치-및-데이터-임포트)
- [4단계: 백엔드 배포](#4단계-백엔드-배포)
- [5단계: 프론트엔드 배포](#5단계-프론트엔드-배포)
- [6단계: Kakao API 도메인 등록](#6단계-kakao-api-도메인-등록)
- [7단계: HTTPS 설정 (선택)](#7단계-https-설정-선택)
- [문제 해결](#문제-해결)

---

## 사전 준비사항

### 필요한 것들
- ✅ **AWS 계정** (무료 티어 사용 가능)
- ✅ **Kakao Developers API 키** (재발급 완료)
- ✅ **로컬 MySQL 데이터** (백업 준비)
- ✅ **Git 저장소** (GitHub/GitLab)

### 예상 비용
- **Lightsail 인스턴스**: $10/월 (2GB RAM, 1 vCPU, 60GB SSD) 권장
- **첫 3개월 무료 크레딧** 제공 (신규 사용자)
- **도메인** (선택사항): 약 $12/년

---

## 1단계: Lightsail 인스턴스 생성

### 1.1. AWS Lightsail 콘솔 접속

1. [AWS Lightsail Console](https://lightsail.aws.amazon.com/) 접속
2. AWS 계정으로 로그인
3. 리전 선택: **서울 (ap-northeast-2)** 권장

### 1.2. 인스턴스 생성

1. **"Create instance"** 버튼 클릭
2. 다음 옵션 선택:
   - **Instance location**: Seoul, Zone A (ap-northeast-2a)
   - **Platform**: Linux/Unix
   - **Blueprint**: OS Only → **Ubuntu 24.04 LTS**

3. **인스턴스 플랜 선택**:
   - 권장: **$10/월** (2GB RAM, 1 vCPU, 60GB SSD)
   - 최소: **$5/월** (1GB RAM - MySQL + 백엔드 + 프론트엔드 모두 실행 시 여유 부족)

4. **인스턴스 이름**: `emergency-room-server`

5. **Create instance** 클릭 → 생성 대기 (약 1-2분)

### 1.3. 고정 IP 할당

1. 생성된 인스턴스 클릭
2. **Networking** 탭으로 이동
3. **Create static IP** 클릭
4. 고정 IP 이름: `emergency-room-ip`
5. **Create** 클릭
6. **할당된 IP 주소 기록**: `xx.xx.xx.xx` (예: 13.125.123.45)

### 1.4. 방화벽 설정

**Networking** 탭 → **IPv4 Firewall** 섹션에서 다음 포트 열기:

| 애플리케이션 | 프로토콜 | 포트 범위 | 소스 |
|-------------|---------|----------|------|
| SSH | TCP | 22 | 기본 열림 |
| HTTP | TCP | 80 | 0.0.0.0/0 |
| HTTPS | TCP | 443 | 0.0.0.0/0 |
| Custom | TCP | 8080 | 0.0.0.0/0 |

> **참고**: 8080 포트는 백엔드 API 테스트용. 나중에 Nginx 리버스 프록시 설정 후 닫을 수 있음.

---

## 2단계: 서버 초기 설정

### 2.1. SSH 접속

**방법 A: Lightsail 브라우저 터미널 (가장 간단)**
1. 인스턴스 페이지에서 **Connect using SSH** 버튼 클릭
2. 브라우저에서 터미널 열림

**방법 B: 로컬 터미널 (SSH 클라이언트)**
1. Lightsail 콘솔 → **Account** → **SSH keys** → 키 다운로드
2. 로컬 터미널에서:
```bash
chmod 400 LightsailDefaultKey-ap-northeast-2.pem
ssh -i LightsailDefaultKey-ap-northeast-2.pem ubuntu@xx.xx.xx.xx
```

### 2.2. 시스템 업데이트

```bash
# 패키지 목록 업데이트
sudo apt update

# 설치된 패키지 업그레이드
sudo apt upgrade -y

# 재부팅 (커널 업데이트 시 필요할 수 있음)
sudo reboot
# 1-2분 후 다시 SSH 접속
```

### 2.3. 필수 소프트웨어 설치

```bash
# Java 21 설치 (백엔드용)
sudo apt install -y openjdk-21-jdk

# Git 설치
sudo apt install -y git

# Nginx 설치 (프론트엔드용)
sudo apt install -y nginx

# curl 설치 (API 테스트용)
sudo apt install -y curl

# 설치 확인
java -version        # openjdk version "21.x.x"
git --version        # git version 2.x.x
nginx -v             # nginx version 1.x.x
```

---

## 3단계: MySQL 설치 및 데이터 임포트

### 3.1. MySQL 서버 설치

```bash
# MySQL 8.0 설치
sudo apt install -y mysql-server

# MySQL 서비스 시작 및 자동 시작 설정
sudo systemctl start mysql
sudo systemctl enable mysql

# 상태 확인
sudo systemctl status mysql
# Active: active (running) 확인
```

### 3.2. MySQL 보안 설정

```bash
# MySQL 보안 설정 스크립트 실행
sudo mysql_secure_installation

# 질문에 대한 답변:
# - Validate Password Component? → y (강력한 비밀번호 사용 권장)
# - Password validation policy → 1 (MEDIUM)
# - Set root password? → y → 강력한 비밀번호 입력
# - Remove anonymous users? → y
# - Disallow root login remotely? → y
# - Remove test database? → y
# - Reload privilege tables? → y
```

### 3.3. 데이터베이스 및 사용자 생성

```bash
# MySQL 접속 (root)
sudo mysql

# 또는 비밀번호 설정했다면:
# sudo mysql -p
```

MySQL 프롬프트에서:

```sql
-- 데이터베이스 생성
CREATE DATABASE emergency_room CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 사용자 생성 (비밀번호는 강력하게 설정)
CREATE USER 'emergency_user'@'localhost' IDENTIFIED BY 'your_strong_password_here';

-- 권한 부여
GRANT ALL PRIVILEGES ON emergency_room.* TO 'emergency_user'@'localhost';

-- 권한 적용
FLUSH PRIVILEGES;

-- 확인
SHOW DATABASES;
SELECT user, host FROM mysql.user WHERE user='emergency_user';

-- 종료
EXIT;
```

### 3.4. 로컬 MySQL 데이터 백업 (로컬 PC에서)

```bash
# 로컬 PC에서 MySQL 덤프 생성
mysqldump -u root -p emergency_room > emergency_room_backup.sql

# 파일 크기 확인
ls -lh emergency_room_backup.sql
```

### 3.5. 데이터를 서버로 전송

**방법 A: SCP 사용 (로컬 PC에서)**

```bash
# SCP로 서버에 업로드
scp -i LightsailDefaultKey-ap-northeast-2.pem emergency_room_backup.sql ubuntu@xx.xx.xx.xx:~/

# 비밀번호: 엔터
```

**방법 B: Lightsail 브라우저 터미널 사용**
1. 로컬 PC에서 `emergency_room_backup.sql` 파일 열기
2. 내용 복사 (Ctrl+A, Ctrl+C)
3. 서버에서:
```bash
nano emergency_room_backup.sql
# 붙여넣기 (Ctrl+Shift+V)
# 저장 (Ctrl+O, Enter, Ctrl+X)
```

### 3.6. 데이터 임포트 (서버에서)

```bash
# MySQL에 데이터 임포트
mysql -u emergency_user -p emergency_room < emergency_room_backup.sql
# 비밀번호 입력

# 임포트 확인
mysql -u emergency_user -p emergency_room -e "SHOW TABLES;"
mysql -u emergency_user -p emergency_room -e "SELECT COUNT(*) FROM hospitals;"
mysql -u emergency_user -p emergency_room -e "SELECT COUNT(*) FROM emergency_predictions;"

# 예상 결과:
# - hospitals: 46개
# - emergency_predictions: 1104개 (46개 병원 × 24시간)
```

---

## 4단계: 백엔드 배포

### 4.1. 프로젝트 클론

```bash
# 홈 디렉토리로 이동
cd ~

# Git 저장소 클론
git clone https://github.com/your-username/emergency_room.git

# 디렉토리 이동
cd emergency_room/backend/Hospitals

# 확인
ls -la
# build.gradle, src, gradlew 등이 보여야 함
```

### 4.2. 환경변수 설정

```bash
# 환경변수 파일 편집
sudo nano /etc/environment
```

다음 내용 **추가** (기존 PATH 등은 유지):

```bash
# Emergency Room Backend Configuration
DB_HOST="localhost"
DB_PORT="3306"
DB_NAME="emergency_room"
DB_USERNAME="emergency_user"
DB_PASSWORD="your_strong_password_here"

KAKAO_REST_API_KEY="b1f5dae2faba949439d3596afd13f283"
KAKAO_JS_API_KEY="7456029734da4d8c307798205366c3ee"

PORT="8080"
```

저장 후 종료: `Ctrl+O` → `Enter` → `Ctrl+X`

환경변수 적용:

```bash
# 현재 세션에 적용
source /etc/environment

# 확인
echo $DB_HOST
echo $KAKAO_REST_API_KEY
```

### 4.3. application.properties 파일 생성

```bash
cd ~/emergency_room/backend/Hospitals/src/main/resources

# application.properties.example을 복사
cp application.properties.example application.properties

# 확인 (환경변수가 제대로 설정되어 있으면 수정 불필요)
cat application.properties
```

### 4.4. Gradle 빌드

```bash
cd ~/emergency_room/backend/Hospitals

# Gradle 실행 권한 부여
chmod +x gradlew

# 빌드 (테스트 제외)
./gradlew clean build -x test

# 시간이 좀 걸림 (첫 실행 시 의존성 다운로드)
# BUILD SUCCESSFUL 메시지 확인

# 생성된 JAR 파일 확인
ls -lh build/libs/
# demo-0.0.1-SNAPSHOT.jar 파일 확인
```

**빌드 오류 시:**
```bash
# Gradle 캐시 삭제 후 재시도
rm -rf ~/.gradle/caches
./gradlew clean build -x test --refresh-dependencies
```

### 4.5. systemd 서비스로 등록

백엔드를 백그라운드 서비스로 실행하고 자동 재시작 설정:

```bash
# 서비스 파일 생성
sudo nano /etc/systemd/system/emergency-backend.service
```

다음 내용 입력:

```ini
[Unit]
Description=Emergency Room Backend Service
After=network.target mysql.service

[Service]
Type=simple
User=ubuntu
WorkingDirectory=/home/ubuntu/emergency_room/backend/Hospitals
EnvironmentFile=/etc/environment
ExecStart=/usr/bin/java -Xmx768m -Xms512m -jar /home/ubuntu/emergency_room/backend/Hospitals/build/libs/demo-0.0.1-SNAPSHOT.jar
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal
SyslogIdentifier=emergency-backend

[Install]
WantedBy=multi-user.target
```

저장 후:

```bash
# systemd 데몬 리로드
sudo systemctl daemon-reload

# 서비스 활성화 (부팅 시 자동 시작)
sudo systemctl enable emergency-backend

# 서비스 시작
sudo systemctl start emergency-backend

# 상태 확인
sudo systemctl status emergency-backend
# Active: active (running) 확인
```

### 4.6. 백엔드 로그 확인

```bash
# 실시간 로그 보기
sudo journalctl -u emergency-backend -f

# 최근 100줄 보기
sudo journalctl -u emergency-backend -n 100

# 종료: Ctrl+C
```

**성공 메시지 예시:**
```
Started EmergencyApplication in 15.234 seconds
Tomcat started on port(s): 8080 (http)
```

### 4.7. API 테스트

```bash
# 헬스체크 (다른 터미널에서)
curl http://localhost:8080/api/hospitals

# 또는 외부에서
curl http://xx.xx.xx.xx:8080/api/hospitals

# JSON 응답 확인:
# {"status":"success","message":"병원 목록 조회 성공 (46개)","data":[...]}
```

---

## 5단계: 프론트엔드 배포

### 5.1. Node.js 설치

```bash
# nvm (Node Version Manager) 설치
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash

# 환경변수 적용
source ~/.bashrc

# 또는
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Node.js 20 설치
nvm install 20

# 버전 확인
node -v        # v20.x.x
npm -v         # 10.x.x
```

### 5.2. 프론트엔드 .env 파일 생성

```bash
cd ~/emergency_room/frontend

# .env.production 파일 생성
cat > .env.production << 'EOF'
REACT_APP_API_BASE_URL=/api
REACT_APP_KAKAO_JS_KEY=7456029734da4d8c307798205366c3ee
EOF

# 확인
cat .env.production
```

> **참고**: `REACT_APP_API_BASE_URL=/api`로 설정하면 Nginx 프록시를 통해 백엔드와 통신합니다.

### 5.3. 프론트엔드 빌드

```bash
cd ~/emergency_room/frontend

# 의존성 설치
npm install

# 프로덕션 빌드
npm run build

# 빌드 완료 확인 (약 1-2분 소요)
ls -lh build/
# index.html, static/ 디렉토리 확인
```

**빌드 오류 시:**
```bash
# 캐시 삭제 후 재시도
rm -rf node_modules package-lock.json
npm install
npm run build
```

### 5.4. Nginx 설정

```bash
# Nginx 설정 파일 생성
sudo nano /etc/nginx/sites-available/emergency-room
```

다음 내용 입력:

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name xx.xx.xx.xx;  # 실제 고정 IP로 변경

    root /var/www/emergency-room;
    index index.html;

    # Gzip 압축 활성화
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript
               application/x-javascript application/xml+rss
               application/javascript application/json image/svg+xml;

    # React Router 지원 (SPA)
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
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # 타임아웃 설정
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # 정적 파일 캐싱
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        access_log off;
    }

    # 보안 헤더
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;

    # 로그
    access_log /var/log/nginx/emergency-room-access.log;
    error_log /var/log/nginx/emergency-room-error.log;
}
```

> **중요**: `server_name xx.xx.xx.xx;` 부분을 실제 고정 IP로 변경하세요!

저장 후:

```bash
# 빌드 파일을 Nginx 디렉토리로 복사
sudo mkdir -p /var/www/emergency-room
sudo cp -r ~/emergency_room/frontend/build/* /var/www/emergency-room/

# 권한 설정
sudo chown -R www-data:www-data /var/www/emergency-room
sudo chmod -R 755 /var/www/emergency-room

# Nginx 설정 활성화
sudo ln -s /etc/nginx/sites-available/emergency-room /etc/nginx/sites-enabled/

# 기본 사이트 비활성화 (선택)
sudo rm -f /etc/nginx/sites-enabled/default

# Nginx 설정 테스트
sudo nginx -t
# syntax is ok
# test is successful

# Nginx 재시작
sudo systemctl restart nginx
sudo systemctl enable nginx

# 상태 확인
sudo systemctl status nginx
```

### 5.5. 프론트엔드 접속 테스트

브라우저에서 접속:
```
http://xx.xx.xx.xx
```

**확인 사항:**
- ✅ 카카오 지도가 표시되는지
- ✅ 병원 리스트가 로드되는지
- ✅ 브라우저 콘솔에 오류가 없는지 (F12)

**문제 발생 시:**
```bash
# Nginx 에러 로그 확인
sudo tail -f /var/log/nginx/emergency-room-error.log

# 백엔드 로그 확인
sudo journalctl -u emergency-backend -n 50
```

---

## 6단계: Kakao API 도메인 등록

### 6.1. Kakao Developers 설정

1. [Kakao Developers](https://developers.kakao.com/) 접속 및 로그인
2. **내 애플리케이션** → 해당 앱 선택
3. 좌측 메뉴 → **플랫폼** 클릭

### 6.2. 웹 플랫폼 설정

**사이트 도메인 추가:**
- 기존: `http://localhost:3000` (로컬 개발용)
- **추가**: `http://xx.xx.xx.xx` (Lightsail 고정 IP)

예시:
```
http://localhost:3000
http://13.125.123.45
```

4. **저장** 클릭

### 6.3. CORS 설정 확인 (선택)

백엔드에서 CORS가 특정 도메인만 허용하도록 설정했다면:

```bash
cd ~/emergency_room/backend/Hospitals
nano src/main/java/com/project/emergency/controller/PredictionController.java
```

15번째 줄 확인:
```java
@CrossOrigin(origins = "http://localhost:3000")
```

필요 시 수정:
```java
@CrossOrigin(origins = {"http://localhost:3000", "http://xx.xx.xx.xx"})
```

수정 후 다시 빌드 및 재시작:
```bash
./gradlew build -x test
sudo systemctl restart emergency-backend
```

---

## 7단계: HTTPS 설정 (선택)

도메인이 있는 경우 무료 SSL 인증서(Let's Encrypt) 적용 가능.

### 7.1. 도메인 구매 및 DNS 설정

1. **도메인 구매**: Route53, Namecheap, GoDaddy 등
2. **DNS A 레코드 설정**:
   - 호스트: `@` (또는 `www`)
   - 타입: `A`
   - 값: `xx.xx.xx.xx` (Lightsail 고정 IP)
   - TTL: 300초

예시:
- `emergency-busan.com` → `13.125.123.45`
- `www.emergency-busan.com` → `13.125.123.45`

### 7.2. Certbot 설치

```bash
# Certbot 설치
sudo apt install -y certbot python3-certbot-nginx

# SSL 인증서 발급
sudo certbot --nginx -d emergency-busan.com -d www.emergency-busan.com

# 이메일 입력, 약관 동의 등
# HTTPS 리디렉션 설정: Yes
```

### 7.3. Kakao Developers HTTPS 도메인 추가

1. Kakao Developers → 플랫폼 설정
2. 사이트 도메인 추가:
   - `https://emergency-busan.com`
   - `https://www.emergency-busan.com`

### 7.4. 자동 갱신 확인

```bash
# 자동 갱신 테스트
sudo certbot renew --dry-run

# cron job 확인 (자동 설정됨)
sudo systemctl status certbot.timer
```

---

## 문제 해결

### 1. 백엔드가 시작되지 않음

```bash
# 로그 확인
sudo journalctl -u emergency-backend -n 100 --no-pager

# 일반적인 문제:
# - MySQL 연결 실패: /etc/environment의 DB 설정 확인
# - 포트 충돌: sudo lsof -i :8080
# - 메모리 부족: free -h (스왑 메모리 추가 고려)
```

**MySQL 연결 오류:**
```bash
# MySQL 서비스 확인
sudo systemctl status mysql

# 사용자 권한 확인
mysql -u emergency_user -p -e "SHOW DATABASES;"
```

### 2. 프론트엔드에서 API 호출 실패

```bash
# Nginx 에러 로그
sudo tail -f /var/log/nginx/emergency-room-error.log

# 백엔드 상태 확인
curl http://localhost:8080/api/hospitals

# Nginx 프록시 설정 확인
sudo nginx -t
```

**502 Bad Gateway 오류:**
- 백엔드가 실행 중인지 확인: `sudo systemctl status emergency-backend`
- 방화벽 확인: `sudo ufw status` (비활성화 상태여야 함)

### 3. 카카오 지도가 표시되지 않음

**브라우저 콘솔 확인 (F12):**

**오류: "appkey is not registered"**
- Kakao Developers에서 도메인 등록 확인
- `http://xx.xx.xx.xx` 형식으로 정확히 입력했는지 확인

**오류: "CORS policy"**
- 백엔드 `@CrossOrigin` 설정 확인
- Nginx 프록시 설정 확인

**public/index.html의 API 키 확인:**
```bash
cd ~/emergency_room/frontend
grep "appkey" public/index.html
# 7456029734da4d8c307798205366c3ee 확인
```

### 4. 데이터베이스 데이터 누락

```bash
# 테이블 확인
mysql -u emergency_user -p emergency_room -e "SHOW TABLES;"

# 데이터 개수 확인
mysql -u emergency_user -p emergency_room -e "SELECT COUNT(*) FROM hospitals;"
mysql -u emergency_user -p emergency_room -e "SELECT COUNT(*) FROM emergency_predictions;"

# 데이터 재임포트
mysql -u emergency_user -p emergency_room < ~/emergency_room_backup.sql
```

### 5. 메모리 부족 문제

1GB RAM 인스턴스 사용 시:

```bash
# 메모리 확인
free -h

# 스왑 메모리 생성 (2GB)
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile

# 영구 설정
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab

# 확인
free -h
```

### 6. 로그 파일 확인 명령어 모음

```bash
# 백엔드 로그 (실시간)
sudo journalctl -u emergency-backend -f

# Nginx 액세스 로그
sudo tail -f /var/log/nginx/emergency-room-access.log

# Nginx 에러 로그
sudo tail -f /var/log/nginx/emergency-room-error.log

# MySQL 에러 로그
sudo tail -f /var/log/mysql/error.log

# 시스템 전체 로그
sudo journalctl -xe
```

---

## 유지보수

### 코드 업데이트 시

**백엔드 업데이트:**
```bash
cd ~/emergency_room
git pull

cd backend/Hospitals
./gradlew clean build -x test
sudo systemctl restart emergency-backend

# 로그 확인
sudo journalctl -u emergency-backend -f
```

**프론트엔드 업데이트:**
```bash
cd ~/emergency_room
git pull

cd frontend
npm run build

sudo rm -rf /var/www/emergency-room/*
sudo cp -r build/* /var/www/emergency-room/
sudo systemctl reload nginx
```

### 서비스 관리 명령어

```bash
# 백엔드
sudo systemctl status emergency-backend   # 상태 확인
sudo systemctl start emergency-backend    # 시작
sudo systemctl stop emergency-backend     # 중지
sudo systemctl restart emergency-backend  # 재시작

# Nginx
sudo systemctl status nginx
sudo systemctl reload nginx    # 설정만 리로드 (다운타임 없음)
sudo systemctl restart nginx   # 완전 재시작

# MySQL
sudo systemctl status mysql
sudo systemctl restart mysql
```

### 모니터링

**디스크 사용량:**
```bash
df -h
du -sh ~/emergency_room/*
```

**메모리 사용량:**
```bash
free -h
top
htop  # sudo apt install htop
```

**네트워크 연결:**
```bash
sudo netstat -tlnp | grep -E '80|8080|3306'
```

---

## 백업 및 복구

### 데이터베이스 백업

```bash
# 자동 백업 스크립트 생성
mkdir -p ~/backups

cat > ~/backup-db.sh << 'EOF'
#!/bin/bash
BACKUP_DIR=~/backups
DATE=$(date +%Y%m%d_%H%M%S)
mysqldump -u emergency_user -p'your_password' emergency_room > $BACKUP_DIR/emergency_room_$DATE.sql
find $BACKUP_DIR -name "*.sql" -mtime +7 -delete
EOF

chmod +x ~/backup-db.sh

# cron으로 매일 자동 백업 (새벽 2시)
crontab -e
# 다음 줄 추가:
# 0 2 * * * /home/ubuntu/backup-db.sh
```

### 복구

```bash
mysql -u emergency_user -p emergency_room < ~/backups/emergency_room_20241020_020000.sql
```

---

## 성능 최적화

### Nginx 캐싱 설정 추가

```bash
sudo nano /etc/nginx/nginx.conf
```

`http {}` 블록 안에 추가:
```nginx
# 캐시 설정
proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=api_cache:10m max_size=100m inactive=60m;
```

### Java 힙 메모리 조정

```bash
sudo nano /etc/systemd/system/emergency-backend.service
```

`ExecStart` 라인 수정:
```ini
# 2GB RAM 인스턴스: -Xmx768m -Xms512m
# 1GB RAM 인스턴스: -Xmx512m -Xms256m
ExecStart=/usr/bin/java -Xmx768m -Xms512m -jar ...
```

```bash
sudo systemctl daemon-reload
sudo systemctl restart emergency-backend
```

---

## 보안 권장사항

1. **방화벽 활성화 (선택):**
```bash
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

2. **SSH 키 인증 강화:**
   - 비밀번호 로그인 비활성화
   - 루트 로그인 비활성화

3. **정기 업데이트:**
```bash
sudo apt update && sudo apt upgrade -y
```

4. **로그 모니터링:**
```bash
sudo apt install -y fail2ban
sudo systemctl enable fail2ban
```

---

## 참고 자료

- [AWS Lightsail 공식 문서](https://lightsail.aws.amazon.com/ls/docs)
- [Kakao Maps API 가이드](https://apis.map.kakao.com/web/guide/)
- [Spring Boot 배포 가이드](https://docs.spring.io/spring-boot/docs/current/reference/html/deployment.html)
- [Nginx 공식 문서](https://nginx.org/en/docs/)
- [MySQL 8.0 문서](https://dev.mysql.com/doc/refman/8.0/en/)

---

## 체크리스트

배포 완료 후 확인:

- [ ] Lightsail 인스턴스 생성 및 고정 IP 할당
- [ ] MySQL 설치 및 데이터 임포트 완료
- [ ] 백엔드 API 정상 작동 (`http://xx.xx.xx.xx:8080/api/hospitals`)
- [ ] 프론트엔드 정상 표시 (`http://xx.xx.xx.xx`)
- [ ] 카카오 지도 정상 렌더링
- [ ] Kakao Developers에 도메인 등록
- [ ] **모바일에서 GPS 기반 위치 테스트** 🎯

---

**🎉 배포 완료! 이제 모바일에서 `http://xx.xx.xx.xx`로 접속해서 GPS 기능을 테스트하세요!**
