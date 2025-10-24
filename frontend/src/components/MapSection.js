// src/components/MapSection.js
import React, { useEffect, useRef, useState } from 'react';

const MapSection = ({ hospitals, onMarkerClick, userLocation }) => {
  const mapContainer = useRef(null);
  const [map, setMap] = useState(null);
  const [clusterer, setClusterer] = useState(null);
  const infowindowRef = useRef(null);
  const userMarkerRef = useRef(null);
  const userOverlayRef = useRef(null);

  // 카카오맵 초기화
  useEffect(() => {
    if (!window.kakao || !window.kakao.maps) {
      console.error('카카오맵 SDK가 로드되지 않았습니다.');
      return;
    }

    const container = mapContainer.current;
    if (!container) return;

    const options = {
      center: new window.kakao.maps.LatLng(35.1697, 129.0704), // 양정역
      level: 7  // 전체 부산 지역이 보이도록 레벨 조정
    };

    const kakaoMap = new window.kakao.maps.Map(container, options);
    setMap(kakaoMap);

    // 지도 컨트롤 추가
    const zoomControl = new window.kakao.maps.ZoomControl();
    kakaoMap.addControl(zoomControl, window.kakao.maps.ControlPosition.RIGHT);

    // 마커 클러스터러 생성
    const markerClusterer = new window.kakao.maps.MarkerClusterer({
      map: kakaoMap,
      averageCenter: true,  // 클러스터 중심을 마커 평균 위치로
      minLevel: 5,  // 레벨 5 이상에서 클러스터링 시작
      disableClickZoom: false,  // 클러스터 클릭 시 확대
      styles: [{
        width : '50px', 
        height : '50px',
        background: 'rgba(102, 126, 234, .8)',
        borderRadius: '25px',
        color: '#fff',
        textAlign: 'center',
        fontWeight: 'bold',
        lineHeight: '51px'
      }]
    });

    setClusterer(markerClusterer);

    // 인포윈도우 생성
    infowindowRef.current = new window.kakao.maps.InfoWindow({
      zIndex: 10,
      removable: true
    });

    console.log('카카오맵 및 클러스터러 초기화 완료');
  }, []);

  // 병원 마커 표시 (클러스터링 적용)
  useEffect(() => {
    if (!map || !hospitals || hospitals.length === 0 || !clusterer) return;

    // 기존 클러스터 초기화
    clusterer.clear();

    const markers = [];

    hospitals.forEach(hospital => {
      // 마커 위치
      const position = new window.kakao.maps.LatLng(
        hospital.latitude, 
        hospital.longitude
      );

      // 혼잡도별 마커 이미지 설정
      let markerImageSrc = '';
      let markerSize = new window.kakao.maps.Size(30, 30);
      
      if (hospital.congestion === 'green') {
        markerImageSrc = 'data:image/svg+xml;base64,' + btoa(`
          <svg width="30" height="30" xmlns="http://www.w3.org/2000/svg">
            <circle cx="15" cy="15" r="12" fill="#10b981" stroke="white" stroke-width="3"/>
          </svg>
        `);
      } else if (hospital.congestion === 'yellow') {
        markerImageSrc = 'data:image/svg+xml;base64,' + btoa(`
          <svg width="30" height="30" xmlns="http://www.w3.org/2000/svg">
            <circle cx="15" cy="15" r="12" fill="#fbbf24" stroke="white" stroke-width="3"/>
          </svg>
        `);
      } else if (hospital.congestion === 'red') {
        markerImageSrc = 'data:image/svg+xml;base64,' + btoa(`
          <svg width="30" height="30" xmlns="http://www.w3.org/2000/svg">
            <circle cx="15" cy="15" r="12" fill="#ef4444" stroke="white" stroke-width="3"/>
          </svg>
        `);
      } else {
        markerImageSrc = 'data:image/svg+xml;base64,' + btoa(`
          <svg width="30" height="30" xmlns="http://www.w3.org/2000/svg">
            <circle cx="15" cy="15" r="12" fill="#a0aec0" stroke="white" stroke-width="3"/>
          </svg>
        `);
      }

      const markerImage = new window.kakao.maps.MarkerImage(markerImageSrc, markerSize);

      // 마커 생성
      const marker = new window.kakao.maps.Marker({
        position: position,
        image: markerImage,
        title: hospital.name
      });

      // 마커 클릭 이벤트
      window.kakao.maps.event.addListener(marker, 'click', () => {
        const iwContent = `
          <div style="padding: 15px; width: 280px;">
            <h4 style="margin: 0 0 12px 0; font-size: 16px; font-weight: bold; color: #2d3748;">
              ${hospital.name}
            </h4>
            <div style="font-size: 13px; color: #4a5568; line-height: 1.8;">
              <div style="margin-bottom: 8px;">
                <div style="color: #718096; margin-bottom: 4px;">📍 주소</div>
                <div style="font-size: 12px; color: #2d3748;">${hospital.address || '정보없음'}</div>
              </div>
              ${hospital.phone ? `
              <div style="margin-bottom: 8px;">
                <div style="color: #718096; margin-bottom: 4px;">📞 연락처</div>
                <div style="font-size: 14px; color: #2d3748; font-weight: 500;">${hospital.phone}</div>
              </div>` : ''}
            </div>
            <button onclick="window.postMessage({type: 'hospitalDetail', id: '${hospital.id}'}, '*')"
              style="width: 100%; margin-top: 15px; padding: 10px;
                     background: #667eea; color: white; border: none;
                     border-radius: 6px; cursor: pointer; font-size: 14px;
                     font-weight: 500; transition: background 0.2s;">
              상세정보 보기
            </button>
          </div>`;
        
        infowindowRef.current.setContent(iwContent);
        infowindowRef.current.open(map, marker);
      });

      markers.push(marker);
    });

    // 클러스터러에 마커들 추가
    clusterer.addMarkers(markers);
    
    console.log(`${hospitals.length}개 병원 마커 클러스터링 완료`);
  }, [map, hospitals, clusterer]);

  // 메시지 이벤트 리스너
  useEffect(() => {
    const handleMessage = (e) => {
      if (e.data.type === 'hospitalDetail') {
        onMarkerClick(e.data.id);
        if (infowindowRef.current) {
          infowindowRef.current.close();
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onMarkerClick]);

  // 현재 위치 마커 표시
  useEffect(() => {
    if (!map || !userLocation) return;

    // 기존 마커 제거
    if (userMarkerRef.current) {
      userMarkerRef.current.setMap(null);
    }
    if (userOverlayRef.current) {
      userOverlayRef.current.setMap(null);
    }

    // 현재 위치 마커 이미지 (파란색 핀 모양)
    const userMarkerSrc = 'data:image/svg+xml;base64,' + btoa(`
      <svg width="40" height="50" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="2"/>
            <feOffset dx="0" dy="2" result="offsetblur"/>
            <feComponentTransfer>
              <feFuncA type="linear" slope="0.3"/>
            </feComponentTransfer>
            <feMerge>
              <feMergeNode/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        <path d="M20 5 C13 5 7 11 7 18 C7 27 20 45 20 45 C20 45 33 27 33 18 C33 11 27 5 20 5 Z"
              fill="#4299e1" stroke="white" stroke-width="3" filter="url(#shadow)"/>
        <circle cx="20" cy="18" r="6" fill="white"/>
        <circle cx="20" cy="18" r="3" fill="#4299e1"/>
      </svg>
    `);

    const userMarkerSize = new window.kakao.maps.Size(40, 50);
    const userMarkerImage = new window.kakao.maps.MarkerImage(userMarkerSrc, userMarkerSize);

    const userPosition = new window.kakao.maps.LatLng(userLocation.lat, userLocation.lng);

    // 현재 위치 마커 생성
    const userMarker = new window.kakao.maps.Marker({
      position: userPosition,
      image: userMarkerImage,
      zIndex: 1000 // 병원 마커보다 위에 표시
    });

    userMarker.setMap(map);
    userMarkerRef.current = userMarker;

    // "현재위치" 텍스트 오버레이
    const overlayContent = `
      <div style="
        position: relative;
        bottom: 60px;
        background: #4299e1;
        color: white;
        padding: 6px 12px;
        border-radius: 16px;
        font-size: 13px;
        font-weight: 600;
        box-shadow: 0 3px 8px rgba(66, 153, 225, 0.4);
        white-space: nowrap;
        border: 2px solid white;
      ">
        📍 현재위치
      </div>
    `;

    const customOverlay = new window.kakao.maps.CustomOverlay({
      position: userPosition,
      content: overlayContent,
      yAnchor: 1,
      zIndex: 999
    });

    customOverlay.setMap(map);
    userOverlayRef.current = customOverlay;

    console.log('✅ 현재 위치 마커 표시:', userLocation);

    // 정리 함수
    return () => {
      if (userMarkerRef.current) {
        userMarkerRef.current.setMap(null);
      }
      if (userOverlayRef.current) {
        userOverlayRef.current.setMap(null);
      }
    };
  }, [map, userLocation]);

  // 내 위치로 이동 버튼
  const handleCenterToUser = () => {
    if (map && userLocation) {
      map.setCenter(new window.kakao.maps.LatLng(userLocation.lat, userLocation.lng));
      map.setLevel(5);  // 확대
    }
  };

  // 전체 보기 버튼
  const handleShowAll = () => {
    if (map) {
      map.setCenter(new window.kakao.maps.LatLng(35.1796, 129.0756));
      map.setLevel(8);  // 부산 전체가 보이도록
    }
  };

  return (
    <div className="map-section" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* 지도 컨트롤 - 검색반경 제거, 버튼만 표시 */}
      <div className="map-controls">
        <div className="control-group">
          <button onClick={handleCenterToUser} className="control-btn">
            📍 내 위치
          </button>
          <button onClick={handleShowAll} className="control-btn">
            🗺️ 전체보기
          </button>
        </div>
      </div>
      
      {/* 카카오맵 컨테이너 */}
      <div 
        ref={mapContainer}
        className="map-container"
        style={{ 
          width: '100%', 
          flex: 1,
          minHeight: '400px'
        }}
      />
      
{/* 범례 */}
<div className="map-legend">
  <div className="legend-container">
    <div className="legend-title">혼잡도 범례</div>
    <div className="legend-items">
      <div className="legend-item">
        <div className="legend-color green"></div>
        <span>여유 (대기 30분 이하)</span>
      </div>
      <div className="legend-item">
        <div className="legend-color yellow"></div>
        <span>보통 (대기 30-60분)</span>
      </div>
      <div className="legend-item">
        <div className="legend-color red"></div>
        <span>혼잡 (대기 60분 이상)</span>
      </div>
      <div className="legend-item">
        <div className="legend-color gray"></div>
        <span>정보없음</span>
      </div>
    </div>
  </div>
</div>
    </div>
  );
};

export default MapSection;