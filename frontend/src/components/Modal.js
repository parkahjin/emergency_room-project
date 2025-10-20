// src/components/Modal.js
import React, { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { getHospitalRoute } from '../services/api';  // import 추가

// Chart.js 등록
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const Modal = ({ hospital, isOpen, onClose, onMakeCall, onOpenDirections }) => {
  const [selectedTime, setSelectedTime] = useState('1hour');
  const [chartData, setChartData] = useState(null);
  const [predictions24h, setPredictions24h] = useState([]);
  const [routeInfo, setRouteInfo] = useState(null);

  // 카카오 경로 정보 가져오기
  useEffect(() => {
    const fetchRouteInfo = async () => {
      if (!hospital?.id) return;
      
      try {
        // 사용자 위치 (양정역)
        const userLocation = { lat: 35.1697, lng: 129.0704 };
        const result = await getHospitalRoute(hospital.id, userLocation);
        
        console.log('모달 경로 정보:', result);
        
        if (result?.status === 'success' && result?.data) {
          setRouteInfo(result.data);
        }
      } catch (error) {
        console.error('모달 경로 정보 조회 실패:', error);
      }
    };

    if (isOpen && hospital) {
      fetchRouteInfo();
    }
  }, [isOpen, hospital?.id]);

  // 24시간 예측 데이터 가져오기
  useEffect(() => {
    const fetch24HourPredictions = async () => {
      if (!hospital?.id) return;

      try {
        const response = await fetch(`http://localhost:8080/api/predictions/${hospital.id}/all`);
        const data = await response.json();
        
        if (data.status === 'success' && data.data) {
          setPredictions24h(data.data);
          
          // 차트 데이터 설정
          const chartLabels = data.data.map(p => `${p.predictionHour}시`);
          const waitTimes = data.data.map(p => p.predictedWaitTime);
          
          setChartData({
            labels: chartLabels,
            datasets: [{
              label: '예상 대기시간 (분)',
              data: waitTimes,
              borderColor: 'rgb(102, 126, 234)',
              backgroundColor: 'rgba(102, 126, 234, 0.1)',
              tension: 0.4,
              fill: true,
              pointBackgroundColor: data.data.map(p => {
                if (p.predictedWaitTime <= 30) return '#48bb78';
                if (p.predictedWaitTime <= 60) return '#ed8936';
                return '#f56565';
              }),
              pointRadius: 5,
              pointHoverRadius: 7
            }]
          });
        }
      } catch (error) {
        console.error('예측 데이터 로드 실패:', error);
      }
    };

    if (isOpen && hospital) {
      fetch24HourPredictions();
    }
  }, [isOpen, hospital]);

  // 차트 옵션
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const value = context.parsed.y;
            let status = '여유';
            if (value > 60) status = '혼잡';
            else if (value > 30) status = '보통';
            return `대기: ${value}분 (${status})`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        ticks: {
          stepSize: 20,
          callback: (value) => value + '분'
        }
      }
    }
  };

  // N시간 후 예측 가져오기
  const getFuturePrediction = (hoursLater) => {
    const currentHour = new Date().getHours();
    const targetHour = (currentHour + hoursLater) % 24;
    const prediction = predictions24h.find(p => p.predictionHour === targetHour);
    
    if (prediction) {
      return {
        time: `${targetHour}시`,
        waitTime: `${prediction.predictedWaitTime}분`,
        level: prediction.congestionLevel,
        color: prediction.congestionColor
      };
    }
    return null;
  };

  // ESC 키로 모달 닫기
  useEffect(() => {
    const handleEscapeKey = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscapeKey);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
      document.body.style.overflow = 'auto';
    };
  }, [isOpen, onClose]);

  // 모달 외부 클릭 시 닫기
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleTimeTabClick = (timeType) => {
    setSelectedTime(timeType);
  };

  const handleMakeCall = () => {
    onMakeCall(hospital.phone);
  };

  const handleOpenDirections = () => {
    onOpenDirections(hospital);
  };

  if (!isOpen || !hospital) return null;

  // 선택된 시간의 예측 정보
  const selectedHours = selectedTime === '1hour' ? 1 : 
                        selectedTime === '2hour' ? 2 : 3;
  const futurePrediction = getFuturePrediction(selectedHours);

  // 실제 표시할 거리와 시간 정보
  const displayDistance = routeInfo?.distanceKm ? `${routeInfo.distanceKm}km` : (hospital.distance || '계산중...');
  const displayDuration = routeInfo?.durationMin ? `${routeInfo.durationMin}분` : (hospital.driveTime || '계산중...');

  console.log('모달 표시 정보:', {
    hospitalName: hospital.name,
    routeInfo: routeInfo,
    displayDistance: displayDistance,
    displayDuration: displayDuration
  });

  return (
    <div 
      className="modal-overlay" 
      style={{ display: isOpen ? 'flex' : 'none' }}
      onClick={handleOverlayClick}
    >
      <div className="modal">
        <div className="modal-header">
          <div className="modal-title">
            {hospital.name} 응급의료센터
          </div>
          <button className="close-btn" onClick={onClose}>
            &times;
          </button>
        </div>
        
        <div className="modal-content">
          {/* 현재 상태 섹션 */}
          <div className="status-section">
            <div className={`status-indicator-large ${hospital.congestion}`}></div>
            <div className="status-text-section">
              <h3>현재 {hospital.status || '정보없음'}</h3>
              <p>예상 대기시간: {hospital.waitTime || '정보없음'}</p>
            </div>
          </div>

          {/* 혼잡도 예측 섹션 */}
          <div className="prediction-section">
            <div className="section-title">📊 24시간 혼잡도 예측</div>
            <div className="prediction-chart" style={{ height: '200px', padding: '10px' }}>
              {chartData ? (
                <Line data={chartData} options={chartOptions} />
              ) : (
                <div style={{ textAlign: 'center', paddingTop: '80px' }}>
                  그래프 로딩 중...
                </div>
              )}
            </div>
            <div className="time-tabs">
              <button 
                className={`time-tab ${selectedTime === '1hour' ? 'active' : ''}`}
                onClick={() => handleTimeTabClick('1hour')}
              >
                1시간 후
              </button>
              <button 
                className={`time-tab ${selectedTime === '2hour' ? 'active' : ''}`}
                onClick={() => handleTimeTabClick('2hour')}
              >
                2시간 후
              </button>
              <button 
                className={`time-tab ${selectedTime === '3hour' ? 'active' : ''}`}
                onClick={() => handleTimeTabClick('3hour')}
              >
                3시간 후
              </button>
            </div>
            
            {/* 선택된 시간의 예측 표시 */}
            {futurePrediction && (
              <div style={{ 
                marginTop: '15px', 
                padding: '10px', 
                backgroundColor: '#f7fafc', 
                borderRadius: '8px',
                textAlign: 'center'
              }}>
                <strong>{futurePrediction.time}</strong> 예상: 
                <span style={{ 
                  color: futurePrediction.color === 'green' ? '#48bb78' : 
                         futurePrediction.color === 'red' ? '#f56565' : '#ed8936',
                  fontWeight: 'bold',
                  marginLeft: '8px'
                }}>
                  {futurePrediction.level} ({futurePrediction.waitTime})
                </span>
              </div>
            )}
          </div>

          {/* 정보 그리드 - 카카오 경로 정보 우선 사용 */}
          <div className="info-grid">
            <div className="info-card">
              <h4>📍 주소</h4>
              <p style={{fontSize: '13px'}}>{hospital.address || '정보없음'}</p>
            </div>
            <div className="info-card">
              <h4>📞 응급실 직통</h4>
              <p>{hospital.phone || '정보없음'}</p>
            </div>
            <div className="info-card">
              <h4>🚗 거리</h4>
              <p>{displayDistance}</p>
            </div>
            <div className="info-card">
              <h4>🚘 실시간 소요시간</h4>
              <p>{displayDuration}</p>
            </div>
            <div className="info-card">
              <h4>🛏️ 병상 수</h4>
              <p>{hospital.beds || hospital.bedsTotal || 0}개</p>
            </div>
            <div className="info-card">
              <h4>🕐 업데이트</h4>
              <p>{new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}</p>
            </div>
          </div>

          {/* 액션 버튼들 */}
          <div className="action-buttons">
            <button 
              className="action-btn btn-primary" 
              onClick={handleOpenDirections}
            >
              🚗 길찾기
            </button>
            <button 
              className="action-btn btn-secondary" 
              onClick={handleMakeCall}
            >
              📞 전화걸기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modal;