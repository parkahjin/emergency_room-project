// src/services/api.js
import axios from 'axios';

// 백엔드 API 기본 URL (Nginx 프록시를 통해 접근)
const API_BASE_URL = '/api';

// Axios 인스턴스 생성
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, // 10초
  headers: {
    'Content-Type': 'application/json',
  },
});

// ========================================
// 병원 관련 API
// ========================================

/**
 * 전체 병원 목록 조회
 */
export const getAllHospitals = async () => {
  try {
    const response = await api.get('/hospitals');
    return response.data;
  } catch (error) {
    console.error('전체 병원 조회 실패:', error);
    throw error;
  }
};

/**
 * 특정 병원 상세 조회
 */
export const getHospitalById = async (hospitalId) => {
  try {
    const response = await api.get(`/hospitals/${hospitalId}`);
    return response.data;
  } catch (error) {
    console.error('병원 상세 조회 실패:', error);
    throw error;
  }
};

/**
 * 구별 병원 조회
 */
export const getHospitalsByDistrict = async (district) => {
  try {
    const response = await api.get(`/hospitals/district/${district}`);
    return response.data;
  } catch (error) {
    console.error('구별 병원 조회 실패:', error);
    throw error;
  }
};

/**
 * 병원 검색
 */
export const searchHospitals = async (keyword) => {
  try {
    const response = await api.get('/hospitals/search', {
      params: { keyword }
    });
    return response.data;
  } catch (error) {
    console.error('병원 검색 실패:', error);
    throw error;
  }
};

/**
 * 근처 병원 조회
 */
export const getNearbyHospitals = async (latitude, longitude, limit = 10) => {
  try {
    const response = await api.post('/hospitals/nearby', {
      latitude,
      longitude,
      limit
    });
    return response.data;
  } catch (error) {
    console.error('근처 병원 조회 실패:', error);
    throw error;
  }
};

// ========================================
// 혼잡도 예측 관련 API
// ========================================

/**
 * 특정 병원의 현재 혼잡도 조회
 */
export const getCurrentPrediction = async (hospitalId) => {
  try {
    const response = await api.get(`/predictions/${hospitalId}/current`);
    return response.data;
  } catch (error) {
    console.error('현재 혼잡도 조회 실패:', error);
    throw error;
  }
};

/**
 * 특정 병원의 24시간 예측 조회
 */
export const getAllPredictions = async (hospitalId) => {
  try {
    const response = await api.get(`/predictions/${hospitalId}/all`);
    return response.data;
  } catch (error) {
    console.error('24시간 예측 조회 실패:', error);
    throw error;
  }
};

/**
 * 모든 병원의 현재 혼잡도 조회
 */
export const getAllCurrentPredictions = async () => {
  try {
    const response = await api.get('/predictions/current/all');
    return response.data;
  } catch (error) {
    console.error('전체 혼잡도 조회 실패:', error);
    throw error;
  }
};

/**
 * 병원 + 현재 혼잡도 통합 조회
 */
export const getHospitalsWithPredictions = async () => {
  try {
    // 병원 목록과 현재 혼잡도를 동시에 가져오기
    const [hospitalsResponse, predictionsResponse] = await Promise.all([
      api.get('/hospitals'),
      api.get('/predictions/current/all')
    ]);
    
    const hospitals = hospitalsResponse.data.data;
    const predictions = predictionsResponse.data.data;
    
    // 병원 정보와 혼잡도 매핑
    const hospitalsWithPredictions = hospitals.map(hospital => {
      const prediction = predictions.find(p => p.hospitalId === hospital.id);
      return {
        ...hospital,
        prediction: prediction || null
      };
    });
    
    return {
      status: 'success',
      data: hospitalsWithPredictions
    };
  } catch (error) {
    console.error('통합 데이터 조회 실패:', error);
    throw error;
  }
};

// ========================================
// 유틸리티 함수
// ========================================

/**
 * 두 지점 간 거리 계산 (Haversine 공식)
 */
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // 지구 반지름 (km)
  
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return Math.round(distance * 10) / 10; // 소수점 1자리
};

/**
 * 도(degree)를 라디안으로 변환
 */
const toRad = (degree) => {
  return degree * (Math.PI / 180);
};

/**
 * 거리를 보기 좋게 포맷
 */
export const formatDistance = (km) => {
  if (km < 1) {
    return `${Math.round(km * 1000)}m`;
  }
  return `${km.toFixed(1)}km`;
};

/**
 * 예상 소요시간 계산 (평균 시속 30km/h 기준)
 */
export const estimateDriveTime = (km) => {
  const hours = km / 30; // 시속 30km 가정
  const minutes = Math.round(hours * 60);
  
  if (minutes < 1) {
    return "1분 이내";
  }
  return `${minutes}분`;
};

/**
 * 병원 목록에 거리 정보 추가
 */
export const addDistanceToHospitals = (hospitals, userLat, userLon) => {
  return hospitals.map(hospital => {
    const distance = calculateDistance(
      userLat,
      userLon,
      hospital.latitude,
      hospital.longitude
    );
    
    return {
      ...hospital,
      distance: distance,
      distanceText: formatDistance(distance),
      driveTime: estimateDriveTime(distance)
    };
  }).sort((a, b) => a.distance - b.distance); // 거리순 정렬
};


// src/services/api.js에 추가
export const getAllPredictionsByHour = async (hour) => {
  try {
    const response = await api.get(`/predictions/hour/${hour}/all`);
    return response.data;
  } catch (error) {
    console.error(`${hour}시 예측 조회 실패:`, error);
    throw error;
  }
};

// ========================================
// 카카오 API 관련
// ========================================

/**
 * 카카오 길찾기 API - 경로 정보 조회
 */
export const getKakaoDirections = async (origin, dest) => {
  try {
    const response = await api.get('/kakao/directions', {
      params: {
        originLat: origin.lat,
        originLng: origin.lng,
        destLat: dest.lat,
        destLng: dest.lng
      }
    });
    return response.data;
  } catch (error) {
    console.error('카카오 경로 조회 실패:', error);
    return null;
  }
};

/**
 * 특정 병원까지의 실시간 경로 조회
 */
export const getHospitalRoute = async (hospitalId, userLocation) => {
  try {
    const response = await api.get(`/kakao/hospital-route/${hospitalId}`, {
      params: {
        userLat: userLocation.lat,
        userLng: userLocation.lng
      }
    });
    return response.data;
  } catch (error) {
    console.error('병원 경로 조회 실패:', error);
    return null;
  }
};

export default api;