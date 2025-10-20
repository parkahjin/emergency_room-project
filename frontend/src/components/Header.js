// src/components/Header.js
import React, { useState } from 'react';

const Header = ({ searchTerm, onSearch, onRefresh, onTimeChange, selectedHour, locationName  }) => {
  const [inputValue, setInputValue] = useState(searchTerm || '');
  
  // 현재 시간
  const currentHour = new Date().getHours();

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    onSearch(inputValue);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearchSubmit(e);
    }
  };

  const handleTimeChange = (e) => {
    if (onTimeChange) {
      onTimeChange(parseInt(e.target.value));
    }
  };

  return (
    <div className="header">
      <div className="header-left">
        <div className="logo">🏥 부산 응급실 혼잡도 예측</div>
        <div className="location-info">
          📍 현재위치: {locationName || '부산시 해운대구 우동'}
        </div>
      </div>
      <div className="header-actions">
        {/* 시간 선택 추가 */}
        <div className="time-selector" style={{
          background: 'rgba(255,255,255,0.2)',
          padding: '8px 12px',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <span style={{ fontSize: '14px' }}>⏰ 예측 시간:</span>
          <select
            value={String(selectedHour !== undefined ? selectedHour : currentHour)}
            onChange={handleTimeChange}
            style={{
              padding: '4px 8px',
              borderRadius: '4px',
              border: 'none',
              background: 'white',
              color: '#2d3748'
            }}
          >
            <option value={String(currentHour)}>현재 ({currentHour}시)</option>
            <option value="2">새벽 2시 (한산)</option>
            <option value="9">오전 9시</option>
            <option value="14">오후 2시</option>
            <option value="19">저녁 7시 (피크)</option>
            <option value="22">밤 10시</option>
          </select>
        </div>

        <div className="search-box">
          <input 
            type="text" 
            className="search-input" 
            placeholder="병원명 또는 지역을 검색하세요..." 
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
          />
          <button 
            className="search-btn" 
            onClick={handleSearchSubmit}
          >
            🔍 검색
          </button>
        </div>
        <button 
          className="refresh-btn" 
          onClick={onRefresh}
        >
          🔄 새로고침
        </button>
      </div>
    </div>
  );
};

export default Header;