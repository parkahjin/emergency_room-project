// src/components/HospitalCard.js
import React, { useState, useEffect } from 'react';
import { getHospitalRoute } from '../services/api';

const HospitalCard = ({ hospital, onHospitalClick, onCallClick, userLocation, onDistanceUpdate }) => {
  const [routeInfo, setRouteInfo] = useState(null);
  const [loading, setLoading] = useState(false);

  // 카카오 경로 정보 가져오기 (이미 App.js에서 계산된 경우 호출하지 않음)
  useEffect(() => {
    // hospital.distance가 이미 있으면 경로 정보 조회하지 않음 (App.js에서 이미 계산됨)
    if (hospital?.distance && hospital?.driveTime) {
      console.log(`${hospital.name}: 이미 계산된 경로 정보 사용`);
      return;
    }

    // distance가 없는 경우에만 경로 조회 (하지만 API 한도 문제로 호출하지 않음)
    // App.js에서 상위 10개만 계산하므로, 나머지는 직선거리 사용
    console.log(`${hospital.name}: 직선거리 사용 (${hospital.distance})`);
  }, [hospital?.id, hospital?.distance, hospital?.driveTime]);

  const fetchRouteInfo = async () => {
    setLoading(true);
    try {
      const result = await getHospitalRoute(hospital.id, userLocation);
      console.log(`${hospital.name} 경로 응답:`, result);
      
      if (result?.status === 'success' && result?.data) {
        setRouteInfo(result.data);
        
        // props.onDistanceUpdate가 아니라 onDistanceUpdate 직접 사용
        if (typeof onDistanceUpdate === 'function') {
          onDistanceUpdate(hospital.id, {
            distance: `${result.data.distanceKm}km`,
            driveTime: `${result.data.durationMin}분`
          });
        }
      }
    } catch (error) {
      console.error('경로 정보 조회 실패:', error);
    } finally {
      setLoading(false);
    }
  };
  
 // HospitalCard.js의 handleCardClick 수정
const handleCardClick = () => {
  if (onHospitalClick) {
    // routeInfo가 있으면 hospital 객체에 병합해서 전달
    const hospitalWithRoute = {
      ...hospital,
      distance: routeInfo?.distanceKm ? `${routeInfo.distanceKm}km` : hospital.distance,
      driveTime: routeInfo?.durationMin ? `${routeInfo.durationMin}분` : hospital.driveTime,
      taxiFare: routeInfo?.taxiFare
    };
    
    // ID가 아닌 전체 객체를 전달하도록 수정 필요
    onHospitalClick(hospital.id);  // 현재는 ID만 전달
  }
};
  
  const handleCallClick = (e) => {
    e.stopPropagation();
    if (onCallClick) {
      onCallClick(hospital.phone);
    }
  };
  
  const congestionClass = hospital.congestion || 'gray';
  const badgeClass = congestionClass === 'green' ? 'congestion-green' :
                      congestionClass === 'yellow' ? 'congestion-yellow' :
                      congestionClass === 'red' ? 'congestion-red' : '';
  
  return (
    <div className="hospital-card" onClick={handleCardClick}>
      <div className="hospital-header">
        <div className="hospital-name-section">
          <div className={`congestion-indicator ${congestionClass}`}></div>
          <span className="hospital-name">{hospital.name}</span>
        </div>
        <span className={`congestion-badge ${badgeClass}`}>
          {hospital.status || '정보없음'}
        </span>
      </div>
      
      <div className="hospital-info">
        <div className="info-item">
          <span className="info-icon">📍</span>
          <span>
          { routeInfo && routeInfo.distanceKm ? 
            `${routeInfo.distanceKm}km` :  // 카카오 도로거리
            hospital.distance || '거리 정보 없음'  // 기본값
          }
  </span>
        </div>
        <div className="info-item">
          <span className="info-icon">⏱️</span>
          <span>대기 {hospital.waitTime || '정보없음'}</span>
        </div>
        
        {/* 카카오 실시간 경로 정보 */}
        {loading ? (
          <div className="info-item">
            <span className="info-icon">🚗</span>
            <span>경로 계산 중...</span>
          </div>
        ) : routeInfo ? (
          <>
            <div className="info-item">
              <span className="info-icon">🚗</span>
              <span>실시간 {routeInfo.durationMin}분</span>
            </div>
            {routeInfo.taxiFare && (
              <div className="info-item">
                <span className="info-icon">🚕</span>
                <span>택시 {routeInfo.taxiFare.toLocaleString()}원</span>
              </div>
            )}
          </>
        ) : (
          <div className="info-item">
            <span className="info-icon">🚗</span>
            <span>차량 약 {hospital.driveTime || '정보없음'}</span>
          </div>
        )}
        
        <div className="info-item">
          <span className="info-icon">🛏️</span>
          <span>병상 {hospital.beds || '정보없음'}</span>
        </div>
      </div>
      
      <div className="hospital-actions">
        <button className="detail-btn" onClick={handleCardClick}>
          상세보기
        </button>
        <button className="call-btn" onClick={handleCallClick}>
          📞 전화
        </button>
      </div>
    </div>
  );
};

export default HospitalCard;