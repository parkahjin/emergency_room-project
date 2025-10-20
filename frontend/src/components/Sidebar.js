// src/components/Sidebar.js
import React from 'react';
import HospitalCard from './HospitalCard';

const Sidebar = ({ 
  hospitals, 
  sortBy, 
  onSortChange, 
  onHospitalClick, 
  onCallClick,
  userLocation,
  onDistanceUpdate  // 이 줄 추가
}) => {
  
  // 정렬 기준 변경 핸들러
  const handleSortClick = (sortType) => {
    console.log('Sidebar - 정렬 버튼 클릭:', sortType);
    onSortChange(sortType);
  };

  // 정렬 함수
  const getSortedHospitals = () => {
    if (!hospitals || hospitals.length === 0) {
      return [];
    }
    
    // 배열 복사
    const hospitalArray = [...hospitals];
    console.log(`정렬 전 병원 수: ${hospitalArray.length}, 정렬 기준: ${sortBy}`);
    
    let sorted = [];
    
    if (sortBy === 'distance') {
      // 거리순 정렬
      sorted = hospitalArray.sort((a, b) => {
        // distance 필드에서 숫자 추출
        const getNum = (str) => {
          if (!str || str === '정보없음') return 999;
          const match = str.match(/[\d.]+/);
          return match ? parseFloat(match[0]) : 999;
        };
        
        const distA = getNum(a.distance);
        const distB = getNum(b.distance);
        
        console.log(`${a.name}: ${a.distance} (${distA}) vs ${b.name}: ${b.distance} (${distB})`);
        
        return distA - distB;
      });
      
    } else if (sortBy === 'congestion') {
      // 혼잡도순 정렬 (대기시간 기준)
      sorted = hospitalArray.sort((a, b) => {
        // waitTime 필드에서 숫자 추출
        const getTime = (str) => {
          if (!str || str === '정보없음') return 999;
          const match = str.match(/\d+/);
          return match ? parseInt(match[0]) : 999;
        };
        
        const timeA = getTime(a.waitTime);
        const timeB = getTime(b.waitTime);
        
        return timeA - timeB;
      });
      
    } else if (sortBy === 'name') {
      // 병원명순 정렬
      sorted = hospitalArray.sort((a, b) => {
        return (a.name || '').localeCompare(b.name || '', 'ko-KR');
      });
      
    } else {
      sorted = hospitalArray;
    }
    
    console.log('정렬 완료, 상위 3개:', sorted.slice(0, 3).map(h => ({
      name: h.name,
      distance: h.distance,
      waitTime: h.waitTime
    })));
    
    return sorted;
  };

  // 정렬된 병원 목록 가져오기
  const sortedHospitals = getSortedHospitals();

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-title">
          📋 근처 응급실 ({hospitals ? hospitals.length : 0}개)
        </div>
        <div className="sort-controls">
          <button 
            className={`sort-btn ${sortBy === 'distance' ? 'active' : ''}`}
            onClick={() => handleSortClick('distance')}
          >
            거리순
          </button>
          <button 
            className={`sort-btn ${sortBy === 'congestion' ? 'active' : ''}`}
            onClick={() => handleSortClick('congestion')}
          >
            혼잡도순
          </button>
          <button 
            className={`sort-btn ${sortBy === 'name' ? 'active' : ''}`}
            onClick={() => handleSortClick('name')}
          >
            병원명순
          </button>
        </div>
      </div>
      
      <div className="hospital-list">
        {sortedHospitals && sortedHospitals.length > 0 ? (
          sortedHospitals.map((hospital, index) => (
            <HospitalCard 
              key={hospital.id}
              hospital={hospital}
              onHospitalClick={onHospitalClick}
              onCallClick={onCallClick}
              userLocation={userLocation}
              onDistanceUpdate={onDistanceUpdate}
            />
          ))
        ) : (
          <div style={{ padding: '20px', textAlign: 'center' }}>
            병원 정보가 없습니다.
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;