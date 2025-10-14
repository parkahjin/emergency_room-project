 // 병원 데이터
        const hospitalData = {
            'ER001': {
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

        let currentHospitalId = '';

        // 모달 관련 함수
        function showDetail(hospitalId) {
            const hospital = hospitalData[hospitalId];
            if (!hospital) return;

            currentHospitalId = hospitalId;

            // 모달 내용 업데이트
            document.getElementById('modalTitle').textContent = hospital.name + ' 응급의료센터';
            document.getElementById('modalStatusIndicator').className = 'status-indicator-large ' + hospital.congestion;
            document.getElementById('modalStatusText').textContent = '현재 ' + hospital.status;
            document.getElementById('modalWaitTime').textContent = '예상 대기시간: ' + hospital.waitTime;
            document.getElementById('modalAddress').textContent = hospital.address;
            document.getElementById('modalPhone').textContent = hospital.phone;
            document.getElementById('modalDistance').textContent = hospital.distance + ' (차량 약 ' + hospital.driveTime + ')';
            document.getElementById('modalBeds').textContent = '사용가능: ' + hospital.beds + '개';
            document.getElementById('modalPatients').textContent = '총 ' + hospital.patients + ' 대기중';
            document.getElementById('modalLastUpdate').textContent = hospital.lastUpdate + ' 업데이트';

            // 모달 표시
            document.getElementById('modalOverlay').style.display = 'flex';
            document.body.style.overflow = 'hidden';
        }

        function closeModal() {
            document.getElementById('modalOverlay').style.display = 'none';
            document.body.style.overflow = 'auto';
        }

        // 시간대 탭 선택
        function selectTimeTab(element, timeType) {
            document.querySelectorAll('.time-tab').forEach(tab => {
                tab.classList.remove('active');
            });
            element.classList.add('active');
            console.log('선택된 시간:', timeType);
        }

        // 검색 기능
        function performSearch() {
            const searchTerm = document.getElementById('mainSearchInput').value;
            console.log('검색어:', searchTerm);
            alert('검색 기능: "' + searchTerm + '"에 대한 결과를 표시합니다.');
        }

        // 정렬 기능
        function sortBy(type) {
            document.querySelectorAll('.sort-btn').forEach(btn => {
                btn.classList.remove('active');
            });
            event.target.classList.add('active');
            console.log('정렬 기준:', type);
            alert('정렬 기능: ' + type + ' 기준으로 정렬합니다.');
        }

        // 반경 변경
        function updateRadius() {
            const radius = document.getElementById('radiusSelect').value;
            console.log('검색 반경:', radius + 'km');
            alert('검색 반경을 ' + radius + 'km로 변경했습니다.');
        }

        // 데이터 새로고침
        function refreshData() {
            console.log('데이터 새로고침');
            alert('최신 혼잡도 정보로 업데이트했습니다!');
        }

        // 전화 걸기
        function makeCall(phoneNumber) {
            console.log('전화 걸기:', phoneNumber);
            alert('전화를 겁니다: ' + phoneNumber);
        }

        function makeCallFromModal() {
            const hospital = hospitalData[currentHospitalId];
            if (hospital) {
                makeCall(hospital.phone);
            }
        }

        // 길찾기
        function openDirections() {
            const hospital = hospitalData[currentHospitalId];
            if (hospital) {
                console.log('길찾기:', hospital.name, hospital.address);
                alert('길찾기: ' + hospital.name + '\n주소: ' + hospital.address + '\n\n네이버 지도 또는 카카오맵으로 연결됩니다.');
            }
        }

        // 키보드 이벤트
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                closeModal();
            }
            if (e.key === 'Enter' && document.activeElement === document.getElementById('mainSearchInput')) {
                performSearch();
            }
        });

        // 모달 외부 클릭 시 닫기
        document.getElementById('modalOverlay').addEventListener('click', function(e) {
            if (e.target === this) {
                closeModal();
            }
        });

        // 페이지 로드 시 초기화
        document.addEventListener('DOMContentLoaded', function() {
            console.log('부산 응급실 혼잡도 예측 서비스 로드 완료');
        });