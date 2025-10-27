-- 특정 병원 3개 정보 수정
-- 실행일: 2025-10-27 10:31:32

USE emergency_room;

UPDATE hospitals
SET address = '부산 부산진구 가야대로 721',
    latitude = 35.15785104,
    longitude = 129.05004180
WHERE id = 'ER027';

UPDATE hospitals
SET address = '부산 부산진구 복지로 75',
    latitude = 35.14616704,
    longitude = 129.02083869
WHERE id = 'ER002';

UPDATE hospitals
SET name = '세웅병원',
    address = '부산 금정구 서동로 162',
    latitude = 35.21438551,
    longitude = 129.10405981,
    phone = '051-500-9700'
WHERE id = 'ER043';
