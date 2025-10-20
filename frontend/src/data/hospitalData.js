// src/data/hospitalData.js
export const hospitalData = {
    'ER001': {
        id: 'ER001',
        name: '부산성모병원',
        address: '부산시 남구 용호동 538-41',
        phone: '051-933-7114',
        distance: '1.2km',
        driveTime: '5분',
        beds: '5/12',
        patients: '8명',
        congestion: 'green',
        status: '여유',
        waitTime: '15분',
        lastUpdate: '5분 전'
    },
    'ER002': {
        id: 'ER002',
        name: '해운대백병원',
        address: '부산시 해운대구 해운대로 875',
        phone: '051-797-0100',
        distance: '2.3km',
        driveTime: '8분',
        beds: '2/8',
        patients: '12명',
        congestion: 'yellow',
        status: '보통',
        waitTime: '30분',
        lastUpdate: '3분 전'
    },
    'ER003': {
        id: 'ER003',
        name: '부산대학교병원',
        address: '부산시 서구 아미동 1가-10',
        phone: '051-240-7119',
        distance: '4.1km',
        driveTime: '12분',
        beds: '3/15',
        patients: '22명',
        congestion: 'red',
        status: '혼잡',
        waitTime: '45분',
        lastUpdate: '2분 전'
    },
    'ER004': {
        id: 'ER004',
        name: '고신대학교복음병원',
        address: '부산시 서구 암남동 34',
        phone: '051-990-6114',
        distance: '5.8km',
        driveTime: '15분',
        beds: '4/10',
        patients: '6명',
        congestion: 'green',
        status: '여유',
        waitTime: '20분',
        lastUpdate: '7분 전'
    },
    'ER005': {
        id: 'ER005',
        name: '동아대학교병원',
        address: '부산시 서구 동대신동 3가-1',
        phone: '051-240-2999',
        distance: '6.2km',
        driveTime: '18분',
        beds: '1/6',
        patients: '9명',
        congestion: 'yellow',
        status: '보통',
        waitTime: '25분',
        lastUpdate: '4분 전'
    },
    'ER006': {
        id: 'ER006',
        name: '동래부민병원',
        address: '부산시 동래구 명장로 12',
        phone: '051-850-8114',
        distance: '7.1km',
        driveTime: '20분',
        beds: '6/9',
        patients: '5명',
        congestion: 'green',
        status: '여유',
        waitTime: '18분',
        lastUpdate: '6분 전'
    },
    'ER007': {
        id: 'ER007',
        name: '부산의료원',
        address: '부산시 연제구 월드컵대로 359',
        phone: '051-607-2000',
        distance: '8.3km',
        driveTime: '25분',
        beds: '2/12',
        patients: '18명',
        congestion: 'red',
        status: '혼잡',
        waitTime: '55분',
        lastUpdate: '1분 전'
    }
};

// 병원 배열로 변환하는 헬퍼 함수
export const getHospitalArray = () => {
    return Object.values(hospitalData);
};