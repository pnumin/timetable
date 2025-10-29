# Implementation Plan

- [x] 1. 프로젝트 초기 설정 및 구조 생성




  - 프론트엔드(React)와 백엔드(Node.js/Express) 프로젝트 디렉토리 구조 생성
  - 필요한 npm 패키지 설치 및 package.json 설정
  - TypeScript 설정 (tsconfig.json)
  - 환경변수 파일 템플릿 생성 (.env.example)
  - _Requirements: 7.1, 7.2, 7.3_

- [x] 2. 데이터베이스 스키마 및 초기화 구현


  - SQLite 데이터베이스 연결 모듈 작성
  - courses, instructors, schedules, off_days 테이블 생성 스크립트 작성
  - 인덱스 생성 및 외래키 제약조건 설정
  - 데이터베이스 초기화 함수 구현
  - _Requirements: 7.3, 1.2_

- [x] 3. 백엔드 Repository 레이어 구현




  - [x] 3.1 CourseRepository 구현


    - CRUD 메서드 작성 (create, findAll, findById, update, delete)
    - 선배정 값으로 필터링하는 메서드 (findByPreAssignment)
    - Excel 순서로 정렬하는 메서드
    - _Requirements: 1.2, 2.1_
  
  - [x] 3.2 InstructorRepository 구현


    - CRUD 메서드 작성
    - 이름으로 교관 찾기 또는 생성하는 메서드 (findOrCreate)
    - _Requirements: 4.2, 4.3_
  
  - [x] 3.3 ScheduleRepository 구현


    - CRUD 메서드 작성
    - 날짜 범위로 일정 조회 메서드 (findByDateRange)
    - 특정 날짜/교시의 중복 체크 메서드 (checkConflict)
    - 특정 날짜/과목의 배정된 시수 조회 메서드
    - Course 및 Instructor 정보를 JOIN하여 조회하는 메서드
    - _Requirements: 2.4, 3.4, 5.4, 6.1, 6.2, 6.3_
  
  - [x] 3.4 OffDayRepository 구현


    - CRUD 메서드 작성
    - 교관별 휴무일 조회 메서드
    - 특정 날짜에 휴무인 교관 목록 조회 메서드
    - _Requirements: 4.2, 4.3, 4.4_

- [x] 4. 엑셀 파일 파싱 및 업로드 기능 구현





  - [x] 4.1 ExcelParser 서비스 구현


    - xlsx 라이브러리를 사용한 엑셀 파일 읽기
    - 필수 컬럼 검증 ('구분', '과목', '시수', '담당교관', '선배정', '평가')
    - 데이터 타입 검증 (시수는 양의 정수, 선배정은 1 또는 2)
    - 파싱된 데이터를 Course 객체 배열로 변환
    - _Requirements: 1.1, 1.3, 1.5_
  
  - [x] 4.2 파일 업로드 API 엔드포인트 구현


    - multer 미들웨어 설정
    - POST /api/upload 엔드포인트 구현
    - 파싱된 데이터를 데이터베이스에 저장
    - 동일 과목에 여러 교관이 있는 경우 처리 로직
    - 교관 자동 생성 (instructors 테이블)
    - 에러 처리 (파일 형식, 컬럼 누락 등)
    - _Requirements: 1.1, 1.2, 1.3, 1.4_

- [x] 5. 시간표 자동 생성 알고리즘 구현




  - [x] 5.1 일과시간 설정 및 유틸리티 함수 구현


    - 요일별 최대 교시 수 및 시간 정보 상수 정의
    - 날짜가 주말인지 확인하는 함수
    - 날짜의 요일을 반환하는 함수
    - 교시 번호를 시간으로 변환하는 함수
    - _Requirements: 3.2_
  
  - [x] 5.2 제약조건 검증 함수 구현


    - 특정 날짜/교시가 이미 배정되었는지 확인하는 함수
    - 특정 날짜에 과목이 몇 시간 배정되었는지 확인하는 함수
    - 교관이 특정 날짜에 휴무인지 확인하는 함수
    - 연속된 빈 교시를 찾는 함수 (findConsecutiveEmptyPeriods)
    - _Requirements: 3.3, 3.6, 3.7_
  
  - [x] 5.3 교과목 배정 로직 구현


    - 다음 사용 가능한 시간대를 찾는 함수 (findNextAvailableSlot)
    - 여러 교관이 있는 경우 시수 분배 계산 함수 (calculateAllocatedHours)
    - 교과목을 시간표에 배정하는 메인 함수
    - _Requirements: 3.1, 3.3, 3.5, 3.8_
  
  - [x] 5.4 ScheduleGenerator 서비스 통합


    - 선배정=2인 교과목을 excel_order 순으로 정렬
    - 선배정된 일정을 TimeSlot 배열에 반영
    - 각 교과목을 순차적으로 배정하는 메인 루프
    - 배정 불가능한 경우 에러 처리
    - 생성된 일정을 데이터베이스에 저장
    - _Requirements: 3.1, 3.4_
  
  - [x] 5.5 시간표 생성 API 엔드포인트 구현


    - POST /api/generate-schedule 엔드포인트 구현
    - 시작 날짜 파라미터 검증
    - ScheduleGenerator 서비스 호출
    - 생성 결과 반환 (성공 여부, 생성된 일정 수)
    - _Requirements: 3.1_

- [x] 6. 선배정 기능 구현




  - [x] 6.1 선배정 검증 로직 구현


    - 선택된 시간 범위가 교과목 시수와 일치하는지 검증
    - 선택된 시간대에 중복이 없는지 검증
    - 선택된 시간이 일과시간 내인지 검증
    - _Requirements: 2.2, 2.3, 2.5_
  
  - [x] 6.2 선배정 API 엔드포인트 구현


    - POST /api/schedules 엔드포인트 구현 (선배정용)
    - 요청 데이터 검증 (courseId, date, startPeriod, endPeriod, instructorId)
    - 검증 로직 호출
    - 데이터베이스에 저장 (is_pre_assigned = true)
    - _Requirements: 2.1, 2.2, 2.4_

- [x] 7. 시간표 조회 API 구현





  - GET /api/schedules 엔드포인트 구현
  - 날짜 범위 파라미터 처리 (startDate, endDate)
  - ScheduleRepository를 통한 데이터 조회
  - Course 및 Instructor 정보를 포함한 응답 반환
  - _Requirements: 6.1, 6.2, 6.3, 6.6_

- [x] 8. 시간표 수동 수정 기능 구현





  - [x] 8.1 시간표 수정 검증 로직 구현


    - 새로운 시간대가 일과시간 내인지 검증
    - 새로운 시간대에 중복이 없는지 검증
    - _Requirements: 5.2, 5.3_
  
  - [x] 8.2 시간표 수정/삭제 API 엔드포인트 구현


    - PUT /api/schedules/:id 엔드포인트 구현
    - DELETE /api/schedules/:id 엔드포인트 구현
    - 검증 로직 호출
    - 데이터베이스 업데이트
    - _Requirements: 5.1, 5.4, 5.5_

- [x] 9. 교관 휴무일 관리 API 구현




  - GET /api/instructors 엔드포인트 구현
  - GET /api/off-days 엔드포인트 구현 (교관별 필터링 지원)
  - POST /api/off-days 엔드포인트 구현
  - DELETE /api/off-days/:id 엔드포인트 구현
  - 중복 휴무일 방지 (UNIQUE 제약조건)
  - _Requirements: 4.1, 4.2, 4.3, 4.4_


- [x] 10. 백엔드 에러 처리 미들웨어 구현




  - ValidationError, ScheduleGenerationError 클래스 정의
  - 전역 에러 핸들러 미들웨어 작성
  - 각 API 엔드포인트에 try-catch 및 에러 처리 추가
  - _Requirements: 1.3, 2.3, 2.5, 5.3_

- [x] 11. React 프론트엔드 기본 설정



  - React Router 설정 (페이지 라우팅)
  - Axios 인스턴스 설정 (API 클라이언트)
  - 전역 에러 처리 유틸리티 작성
  - 공통 레이아웃 컴포넌트 작성
  - _Requirements: 7.1_

- [x] 12. 엑셀 업로드 페이지 구현





  - [x] 12.1 UploadPage 컴포넌트 구현


    - 파일 선택 UI
    - 파일 업로드 버튼 및 진행 상태 표시
    - 업로드 성공/실패 메시지 표시
    - _Requirements: 1.1_
  
  - [x] 12.2 파싱 결과 미리보기 기능 구현

    - 업로드된 교과목 목록을 테이블로 표시
    - 교과목 수, 총 시수 등 요약 정보 표시
    - _Requirements: 1.2_

- [x] 13. 선배정 캘린더 페이지 구현




  - [x] 13.1 PreAssignmentCalendar 컴포넌트 기본 구조


    - FullCalendar 라이브러리 통합
    - 선배정=1인 교과목 목록 조회 및 표시
    - 교과목 선택 UI
    - _Requirements: 2.1_
  
  - [x] 13.2 시간대 선택 및 배정 기능 구현


    - 캘린더에서 날짜 및 시작/종료 교시 선택 UI
    - 선택된 시간이 교과목 시수와 일치하는지 클라이언트 검증
    - 선배정 API 호출 및 결과 처리
    - 배정된 일정을 캘린더에 표시
    - _Requirements: 2.1, 2.2, 2.4_

- [x] 14. 시간표 자동 생성 페이지 구현





  - ScheduleGenerationPage 컴포넌트 구현
  - 시작 날짜 선택 UI (DatePicker)
  - 시간표 생성 버튼 및 진행 상태 표시
  - 생성 API 호출 및 결과 메시지 표시
  - 생성 완료 후 시간표 조회 페이지로 이동
  - _Requirements: 3.1_
- [ ] 15. 시간표 조회 페이지 구현



- [ ] 15. 시간표 조회 페이지 구현

  - [x] 15.1 ScheduleView 컴포넌트 기본 구조


    - 월별/주별/일별 뷰 모드 전환 UI
    - 날짜 네비게이션 컨트롤 (이전/다음)
    - 현재 선택된 날짜 표시
    - _Requirements: 6.1, 6.2, 6.3, 6.5_
  
  - [x] 15.2 월별 뷰 구현


    - FullCalendar의 월별 뷰 사용
    - 일정 데이터 조회 및 캘린더에 표시
    - 각 일정에 과목명, 교관명 표시
    - _Requirements: 6.1, 6.6_
  
  - [x] 15.3 주별/일별 뷰 구현


    - 교시 단위 시간표 테이블 UI
    - 각 교시별로 과목명, 교관명, 시간 정보 표시
    - 빈 교시는 빈 셀로 표시
    - _Requirements: 6.2, 6.3, 6.4, 6.6_
  
  - [x] 15.4 시간표 수동 수정 기능 통합


    - 일정 클릭 시 수정 모달 표시
    - 날짜 및 시간 변경 UI
    - 수정 API 호출 및 결과 처리
    - 삭제 버튼 및 삭제 API 호출
    - _Requirements: 5.1, 5.2, 5.4_

- [ ] 16. 교관 휴무일 관리 페이지 구현





  - InstructorOffDayManagement 컴포넌트 구현
  - 교관 목록 조회 및 선택 UI
  - 선택된 교관의 휴무일 목록 표시
  - 휴무일 추가 UI (DatePicker)
  - 휴무일 삭제 버튼
  - API 호출 및 결과 처리
  - _Requirements: 4.1, 4.2, 4.3, 4.4_

- [ ] 17. 프론트엔드 에러 처리 및 사용자 피드백



  - ApiError 클래스 및 handleApiCall 유틸리티 구현
  - 전역 에러 토스트/알림 컴포넌트 구현
  - 각 API 호출에 에러 처리 추가
  - 로딩 상태 표시 (스피너, 프로그레스 바)
  - _Requirements: 1.3, 2.3, 2.5, 5.3_

- [x] 18. 스타일링 및 UI/UX 개선



  - Tailwind CSS 또는 Material-UI 설정
  - 반응형 디자인 적용
  - 일관된 색상 및 타이포그래피 적용
  - 접근성 개선 (ARIA 레이블, 키보드 네비게이션)
  - _Requirements: 7.1_

- [x] 19. 교과목 관리 페이지 구현 (CRUD)
  - CourseManagementPage 컴포넌트 구현
  - 교과목 목록 조회 및 표시 (테이블 형식)
  - 교과목 추가 기능 (모달 또는 폼)
  - 교과목 수정 기능 (인라인 편집 또는 모달)
  - 교과목 삭제 기능 (확인 다이얼로그)
  - 검색 및 필터링 기능 (구분, 선배정 값 등)
  - 백엔드 API 엔드포인트 추가 (PUT /api/courses/:id, DELETE /api/courses/:id)
  - _Requirements: 1.2, 1.4_

- [x] 20. 시간표 생성 알고리즘 개선





  - [x] 20.1 연강 제한 기능 구현


    - 동일 교관의 동일 과목 3시간 이상 연강 방지 로직 추가
    - getConsecutiveHoursForInstructorCourse 함수 구현
    - findNextAvailableSlot에 연강 체크 로직 통합
    - _Requirements: 3.1_
  
  - [x] 20.2 평가 자동 배정 기능 구현


    - 평가=1인 교과목 완료 후 다음날 2시간 시험 자동 배정
    - 시험 일정 생성 로직 추가 (isExam 플래그)
    - 시험 시간 확보를 위한 슬롯 검색 로직
    - _Requirements: 3.2_
  
  - [x] 20.3 ScheduleGenerator 서비스 업데이트


    - 새로운 제약조건을 반영한 알고리즘 수정
    - 연강 체크 및 평가 배정 통합
    - 에러 처리 및 로깅 개선

- [ ]* 21. 테스트 코드 작성
  - [ ]* 21.1 백엔드 유닛 테스트
    - ExcelParser 테스트
    - ScheduleGenerator 테스트
    - ValidationService 테스트
    - Repository 메서드 테스트
  
  - [ ]* 21.2 백엔드 통합 테스트
    - API 엔드포인트 테스트
    - 데이터베이스 연동 테스트
  
  - [ ]* 21.3 프론트엔드 테스트
    - 컴포넌트 렌더링 테스트
    - 사용자 인터랙션 테스트
    - API 호출 모킹 테스트

- [ ] 22. 시간표 출력 페이지 개선
  - [ ] 22.1 주간 단위 테이블 구조 수정
    - 날짜 범위를 주 단위로 그룹화하는 로직 구현
    - 각 행이 한 주를 나타내도록 테이블 구조 변경
    - 첫 번째 열에 주의 시작 날짜 표시
    - _Requirements: 7.2, 7.3_
  
  - [ ] 22.2 스케줄 표시 개선
    - 각 셀에 해당 날짜의 모든 스케줄 표시
    - 과목명, 교관명, 교시 정보를 명확하게 표시
    - 평가 스케줄에 [평가] 접두사 추가
    - 빈 날짜는 "-"로 표시
    - _Requirements: 7.4, 7.7_
  
  - [ ] 22.3 인쇄 스타일 최적화
    - @media print CSS 규칙 추가
    - 인쇄 시 UI 컨트롤 숨김 처리
    - 테이블 페이지 나누기 최적화
    - 인쇄물 헤더에 날짜 범위 표시
    - _Requirements: 7.5, 7.6_

- [ ] 23. 배포 준비 및 문서화
  - README.md 작성 (설치 방법, 실행 방법)
  - 환경변수 설정 가이드
  - 프론트엔드 빌드 스크립트 작성
  - 프로덕션 환경 설정 (PM2, Nginx 등)
  - 데이터베이스 백업 전략 문서화
  - _Requirements: 8.1, 8.2, 8.3_
