// src/App.js
import React, { useState, useEffect } from 'react';
import './styles/App.css';
import { getHospitalsWithPredictions, addDistanceToHospitals, getAllHospitals } from './services/api';
import Header from './components/Header';
import MapSection from './components/MapSection';
import Sidebar from './components/Sidebar';
import Modal from './components/Modal';
import { getHospitalRoute } from './services/api';  // 추가

function App() {
  // 모든 상태 관리 (맨 위에 모아둠)
  const [searchTerm, setSearchTerm] = useState('');
  const [radius, setRadius] = useState('10');
  const [sortBy, setSortBy] = useState('distance');
  const [selectedHospital, setSelectedHospital] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedHour, setSelectedHour] = useState(new Date().getHours());
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // 위치 관련 상태 (양정인력개발센터 고정)
  const [userLocation, setUserLocation] = useState({
    lat: 35.1697, // 부산 양정인력개발센터 (양정역 인근)
    lng: 129.0704
  });
  const [locationName, setLocationName] = useState('부산진구 양정동');

  // 컴포넌트 마운트 시 실행
  useEffect(() => {
    console.log('useEffect 실행됨');
    getCurrentLocation();
    fetchHospitalsData();
  }, []);

  // 고정 위치 사용 (부산 양정인력개발센터)
  const getCurrentLocation = () => {
    const fixedLocation = {
      lat: 35.1697,  // 부산 양정인력개발센터 (양정역 인근)
      lng: 129.0704
    };
    setUserLocation(fixedLocation);
    // getAddressFromCoords(fixedLocation.lat, fixedLocation.lng); // 주석 처리: 초기 state 값 사용
    console.log('📍 고정 위치 사용:', fixedLocation);
  };

  // 좌표를 주소로 변환
  const getAddressFromCoords = (lat, lng) => {
  console.log(`좌표: 위도 ${lat}, 경도 ${lng}`);
  
  // 부산 16개 구/군 전체
  if (lat >= 35.05 && lat <= 35.35 && lng >= 128.85 && lng <= 129.30) {
    // 해운대구
    if (lat >= 35.14 && lat <= 35.23 && lng >= 129.07 && lng <= 129.20) {
      setLocationName('부산시 해운대구');
    }
    // 수영구
    else if (lat >= 35.13 && lat <= 35.17 && lng >= 129.06 && lng <= 129.13) {
      setLocationName('부산시 수영구');
    }
    // 부산진구
    else if (lat >= 35.14 && lat <= 35.19 && lng >= 129.02 && lng <= 129.07) {
      setLocationName('부산시 부산진구');
    }
    // 동래구
    else if (lat >= 35.19 && lat <= 35.23 && lng >= 129.05 && lng <= 129.10) {
      setLocationName('부산시 동래구');
    }
    // 남구
    else if (lat >= 35.10 && lat <= 35.15 && lng >= 129.02 && lng <= 129.10) {
      setLocationName('부산시 남구');
    }
    // 연제구
    else if (lat >= 35.17 && lat <= 35.21 && lng >= 129.03 && lng <= 129.09) {
      setLocationName('부산시 연제구');
    }
    // 금정구
    else if (lat >= 35.21 && lat <= 35.28 && lng >= 129.02 && lng <= 129.10) {
      setLocationName('부산시 금정구');
    }
    // 기장군
    else if (lat >= 35.18 && lat <= 35.35 && lng >= 129.10 && lng <= 129.30) {
      setLocationName('부산시 기장군');
    }
    // 서구
    else if (lat >= 35.08 && lat <= 35.11 && lng >= 128.96 && lng <= 129.00) {
      setLocationName('부산시 서구');
    }
    // 중구
    else if (lat >= 35.09 && lat <= 35.11 && lng >= 129.02 && lng <= 129.04) {
      setLocationName('부산시 중구');
    }
    // 동구
    else if (lat >= 35.11 && lat <= 35.14 && lng >= 129.03 && lng <= 129.06) {
      setLocationName('부산시 동구');
    }
    // 영도구
    else if (lat >= 35.06 && lat <= 35.09 && lng >= 128.99 && lng <= 129.08) {
      setLocationName('부산시 영도구');
    }
    // 사하구
    else if (lat >= 35.05 && lat <= 35.11 && lng >= 128.93 && lng <= 129.00) {
      setLocationName('부산시 사하구');
    }
    // 사상구
    else if (lat >= 35.13 && lat <= 35.18 && lng >= 128.95 && lng <= 129.01) {
      setLocationName('부산시 사상구');
    }
    // 북구
    else if (lat >= 35.19 && lat <= 35.28 && lng >= 128.94 && lng <= 129.03) {
      setLocationName('부산시 북구');
    }
    // 강서구
    else if (lat >= 35.05 && lat <= 35.21 && lng >= 128.85 && lng <= 128.98) {
      setLocationName('부산시 강서구');
    }
    else {
      setLocationName('부산광역시');
    }
  } else {
    setLocationName('부산 외 지역');
  }
};

const fetchHospitalsData = async () => {
  try {
    setLoading(true);
    console.log('🏥 병원 데이터 로딩 중...');
    
    const response = await getHospitalsWithPredictions();
    let hospitalData = response.data;
    
    console.log('✅ 병원 데이터 로드 완료:', hospitalData.length + '개');
    
    // 거리 정보 추가 - userLocation 사용
    hospitalData = addDistanceToHospitals(
      hospitalData, 
      userLocation.lat, 
      userLocation.lng
    );
    
    // 데이터 포맷팅
    const formattedHospitals = hospitalData.map(hospital => {
      let congestionColor = 'gray';
      
      if (hospital.prediction && hospital.prediction.congestionLevel) {
        const level = hospital.prediction.congestionLevel;
        if (level === '여유') {
          congestionColor = 'green';
        } else if (level === '보통') {
          congestionColor = 'yellow';
        } else if (level === '혼잡') {
          congestionColor = 'red';
        }
      }
      
      return {
        ...hospital,
        congestion: congestionColor,
        status: hospital.prediction?.congestionLevel || '정보없음',
        waitTime: hospital.prediction?.predictedWaitTime 
          ? `${hospital.prediction.predictedWaitTime}분` 
          : '정보없음',
        beds: hospital.bedsTotal || 0,
        distance: hospital.distanceText,
        driveTime: hospital.driveTime
      };
    });
    
    // 직선거리 기준으로 정렬
    formattedHospitals.sort((a, b) => {
      const getNum = (str) => {
        const match = str.match(/[\d.]+/);
        return match ? parseFloat(match[0]) : 999;
      };
      return getNum(a.distance) - getNum(b.distance);
    });
    
    // 상위 10개 병원만 카카오 API로 실제 거리 업데이트 (병렬 호출)
    console.log('🚗 상위 10개 병원 카카오 거리 업데이트 중 (병렬 호출)...');
    const top10Hospitals = formattedHospitals.slice(0, 10);

    const top10Updated = await Promise.all(
      top10Hospitals.map(async (hospital) => {
        try {
          const routeResult = await getHospitalRoute(hospital.id, userLocation);
          if (routeResult?.status === 'success' && routeResult?.data) {
            console.log(`  ✅ ${hospital.name}: ${routeResult.data.distanceKm}km, ${routeResult.data.durationMin}분`);
            return {
              ...hospital,
              distance: `${routeResult.data.distanceKm}km`,
              driveTime: `${routeResult.data.durationMin}분`
            };
          } else {
            console.log(`  ⚠️ ${hospital.name}: API 응답 없음, 직선거리 사용`);
            return hospital;
          }
        } catch (error) {
          console.error(`  ❌ ${hospital.name} 경로 조회 실패:`, error.message);
          return hospital;
        }
      })
    )
    
    // 업데이트된 상위 10개 + 나머지 병원들 합치기
    const finalHospitals = [
      ...top10Updated,
      ...formattedHospitals.slice(10)
    ];
    
    setHospitals(finalHospitals);
    console.log('✅ 데이터 준비 완료');

    const colorCount = finalHospitals.reduce((acc, h) => {
      acc[h.congestion] = (acc[h.congestion] || 0) + 1;
      return acc;
    }, {});
    console.log('혼잡도 색상 분포:', colorCount);
    console.log('필터링 전 병원 수:', finalHospitals.length);
    
  } catch (err) {
    console.error('❌ 데이터 로드 실패:', err);
  } finally {
    setLoading(false);
  }
};

  // 시간 변경 핸들러
  const handleTimeChange = async (hour) => {
    console.log(`시간 변경: ${hour}시`);
    setSelectedHour(hour);
    
    try {
      setLoading(true);
      
      const response = await fetch(`/api/predictions/hour/${hour}/all`);
      const predictionsData = await response.json();
      
      if (predictionsData.status === 'success') {
        const hospitalsResponse = await getAllHospitals();
        const hospitals = hospitalsResponse.data;
        const predictions = predictionsData.data;
        
        let hospitalData = hospitals.map(hospital => {
          const prediction = predictions.find(p => p.hospitalId === hospital.id);
          return {
            ...hospital,
            prediction: prediction || null
          };
        });
        
        // userLocation 사용
        hospitalData = addDistanceToHospitals(
          hospitalData,
          userLocation.lat,
          userLocation.lng
        );
        
        const formattedHospitals = hospitalData.map(hospital => {
          let congestionColor = 'gray';
          
          if (hospital.prediction && hospital.prediction.congestionLevel) {
            const level = hospital.prediction.congestionLevel;
            if (level === '여유') {
              congestionColor = 'green';
            } else if (level === '보통') {
              congestionColor = 'yellow';
            } else if (level === '혼잡') {
              congestionColor = 'red';
            }
          }
          
          return {
            ...hospital,
            congestion: congestionColor,
            status: hospital.prediction?.congestionLevel || '정보없음',
            waitTime: hospital.prediction?.predictedWaitTime 
              ? `${hospital.prediction.predictedWaitTime}분` 
              : '정보없음',
            beds: hospital.bedsTotal || 0,
            distance: hospital.distanceText,
            driveTime: hospital.driveTime
          };
        });
        
        setHospitals(formattedHospitals);
        console.log(`${hour}시 데이터 로드 완료`);
      }
    } catch (error) {
      console.error('시간별 데이터 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // 검색 기능
  const handleSearch = async (term) => {
    setSearchTerm(term);
    console.log('검색어:', term);
    
    if (!term || term.trim() === '') {
      if (selectedHour !== new Date().getHours()) {
        handleTimeChange(selectedHour);
      } else {
        fetchHospitalsData();
      }
      return;
    }
    
    try {
      setLoading(true);
      
      const response = await fetch(`/api/hospitals/search?keyword=${encodeURIComponent(term)}`);
      const searchData = await response.json();
      
      if (searchData.status === 'success') {
        let hospitalData = searchData.data;
        
        const predictionsResponse = await fetch(`/api/predictions/hour/${selectedHour}/all`);
        const predictionsData = await predictionsResponse.json();
        
        if (predictionsData.status === 'success') {
          const predictions = predictionsData.data;
          
          hospitalData = hospitalData.map(hospital => {
            const prediction = predictions.find(p => p.hospitalId === hospital.id);
            return {
              ...hospital,
              prediction: prediction || null
            };
          });
        }
        
        // userLocation 사용
        hospitalData = addDistanceToHospitals(
          hospitalData,
          userLocation.lat,
          userLocation.lng
        );
        
        const formattedHospitals = hospitalData.map(hospital => {
          let congestionColor = 'gray';
          
          if (hospital.prediction && hospital.prediction.congestionLevel) {
            const level = hospital.prediction.congestionLevel;
            if (level === '여유') {
              congestionColor = 'green';
            } else if (level === '보통') {
              congestionColor = 'yellow';
            } else if (level === '혼잡') {
              congestionColor = 'red';
            }
          }
          
          return {
            ...hospital,
            congestion: congestionColor,
            status: hospital.prediction?.congestionLevel || '정보없음',
            waitTime: hospital.prediction?.predictedWaitTime 
              ? `${hospital.prediction.predictedWaitTime}분` 
              : '정보없음',
            beds: hospital.bedsTotal || 0,
            distance: hospital.distanceText,
            driveTime: hospital.driveTime
          };
        });
        
        setHospitals(formattedHospitals);
        console.log(`검색 결과: ${formattedHospitals.length}개 병원`);
        
        if (formattedHospitals.length === 0) {
          alert('검색 결과가 없습니다.');
        }
      }
    } catch (error) {
      console.error('검색 실패:', error);
      alert('검색 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 반경 필터링 함수
  const filterHospitalsByRadius = (hospitals, radiusKm) => {
    return hospitals.filter(hospital => {
      const distance = parseFloat(hospital.distance?.replace('km', '') || 0);
      return distance <= parseFloat(radiusKm);
    });
  };
  
  // 반경 변경
  const handleRadiusChange = (newRadius) => {
    setRadius(newRadius);
    console.log('검색 반경:', newRadius + 'km');
  };
  
  // 정렬 기준 변경
  const handleSortChange = (sortType) => {
    console.log('App.js - 정렬 변경:', sortType);
    setSortBy(sortType);
  };
  
  // 데이터 새로고침
  const handleRefresh = () => {
    console.log('🔄 데이터 새로고침');
    if (selectedHour !== new Date().getHours()) {
      handleTimeChange(selectedHour);
    } else {
      fetchHospitalsData();
    }
  };
  
  // 병원 상세 정보 표시
  const handleShowDetail = (hospitalId) => {
    const hospital = hospitals.find(h => h.id === hospitalId);
    if (hospital) {
      setSelectedHospital(hospital);
      setIsModalOpen(true);
    }
  };
  
  // 모달 닫기
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedHospital(null);
  };
  
  // 전화 걸기
  const handleMakeCall = (phoneNumber) => {
    console.log('전화 걸기:', phoneNumber);
    window.location.href = `tel:${phoneNumber}`;
  };
  
  // 길찾기
  const handleOpenDirections = (hospital) => {
    console.log('길찾기:', hospital.name);
    const kakaoMapUrl = `https://map.kakao.com/link/to/${hospital.name},${hospital.latitude},${hospital.longitude}`;
    window.open(kakaoMapUrl, '_blank');
  };


  // 병원 거리 정보 업데이트 함수
  const updateHospitalDistance = (hospitalId, distanceInfo) => {
  setHospitals(prevHospitals => 
    prevHospitals.map(h => 
      h.id === hospitalId 
        ? { ...h, distance: distanceInfo.distance, driveTime: distanceInfo.driveTime }
        : h
    )
  );
};

  // 로딩 중
  if (loading) {
    return (
      <div className="container">
        <Header 
          searchTerm={searchTerm}
          onSearch={handleSearch}
          onRefresh={handleRefresh}
          onTimeChange={handleTimeChange}
          selectedHour={selectedHour}
          locationName={locationName}
        />
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '70vh',
          fontSize: '24px'
        }}>
          🏥 병원 데이터 로딩 중...
        </div>
      </div>
    );
  }

  // 반경 필터링 적용
  const filteredHospitals = filterHospitalsByRadius(hospitals, radius);

  return (
    <div className="container">
      <Header 
        searchTerm={searchTerm}
        onSearch={handleSearch}
        onRefresh={handleRefresh}
        onTimeChange={handleTimeChange}
        selectedHour={selectedHour}
        locationName={locationName}
      />
      
      <div className="main-content">
        <MapSection 
          hospitals={hospitals}
          radius={radius}
          onRadiusChange={handleRadiusChange}
          onMarkerClick={handleShowDetail}
          userLocation={userLocation} 
        />
        
        <Sidebar 
          hospitals={hospitals}
          sortBy={sortBy}
          onSortChange={handleSortChange}
          onHospitalClick={handleShowDetail}
          onCallClick={handleMakeCall}
          userLocation={userLocation} // 추가
          onDistanceUpdate={updateHospitalDistance}  // 추가
        />
      </div>
      
      <Modal 
        hospital={selectedHospital}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onMakeCall={handleMakeCall}
        onOpenDirections={handleOpenDirections}
      />
    </div>
  );
}

export default App;