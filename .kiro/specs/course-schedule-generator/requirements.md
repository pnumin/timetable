# Requirements Document

## Introduction

본 문서는 '사이버 정보 체계 운용 초급반' 교육 과정의 시간표를 자동으로 생성하고 관리하는 시스템의 요구사항을 정의한다. 관리자는 엑셀 파일로 교과목 정보를 업로드하고, 시스템은 사전 정의된 규칙에 따라 전체 교육 과정의 시간표를 자동으로 생성한다. 시스템은 선배정 기능, 교관 휴무일 관리, 수동 조정 기능을 제공하며, 생성된 시간표는 다양한 형태로 조회할 수 있다.

## Glossary

- **System**: 교육 과정 시간표 자동 생성 시스템
- **Administrator**: 시스템을 사용하여 교과목 정보를 업로드하고 시간표를 관리하는 사용자
- **Course**: 교육 과정을 구성하는 개별 교과목
- **Instructor**: 교과목을 담당하는 교관
- **Class Hour**: 45분 단위의 수업 시간 (1교시 = 45분)
- **Pre-assignment**: 자동 생성 이전에 관리자가 수동으로 특정 날짜와 시간에 배정하는 과정
- **Auto-assignment**: 시스템이 규칙에 따라 자동으로 시간표에 배정하는 과정
- **Schedule**: 생성된 시간표
- **Working Hours**: 일과 시간 (월~금 08:00-17:30, 점심시간 11:35-13:00 제외)
- **Off Day**: 교관의 휴무일
- **Excel File**: 교과목 정보를 포함하는 업로드용 엑셀 파일 (구분, 과목, 시수, 담당교관, 선배정, 평가 컬럼 포함)

## Requirements

### Requirement 1: 엑셀 파일 업로드 및 데이터 저장

**User Story:** As an Administrator, I want to upload an Excel file containing course information, so that the System can store and use this data for schedule generation

#### Acceptance Criteria

1. WHEN the Administrator uploads an Excel File, THE System SHALL parse the file and extract data from columns named '구분', '과목', '시수', '담당교관', '선배정', and '평가'
2. WHEN the Excel File is successfully parsed, THE System SHALL store each row as a Course record in the SQLite database
3. IF the Excel File does not contain all required columns, THEN THE System SHALL display an error message indicating which columns are missing
4. WHEN multiple Instructors are assigned to the same Course, THE System SHALL create separate records for each Instructor with their allocated Class Hours
5. THE System SHALL validate that the '시수' value is a positive integer before storing the data

### Requirement 2: 선배정 기능

**User Story:** As an Administrator, I want to manually pre-assign courses with '선배정' value of 1 to specific dates and times, so that these courses are scheduled before automatic generation

#### Acceptance Criteria

1. WHEN a Course has '선배정' value equal to 1, THE System SHALL allow the Administrator to select a date and time range on the calendar interface
2. WHEN the Administrator selects a time range for Pre-assignment, THE System SHALL verify that the total Class Hours match the Course's '시수' value
3. IF the selected time range does not match the Course's Class Hours, THEN THE System SHALL display an error message and prevent the Pre-assignment
4. WHEN a Pre-assignment is completed, THE System SHALL mark those time slots as occupied in the database
5. THE System SHALL prevent overlapping Pre-assignments for the same time slot

### Requirement 3: 시간표 자동 생성

**User Story:** As an Administrator, I want to generate a schedule automatically by selecting a start date, so that all courses are assigned to available time slots according to predefined rules

#### Acceptance Criteria

1. WHEN the Administrator selects a start date and clicks the schedule generation button, THE System SHALL assign all Courses with '선배정' value of 2 to available time slots in the order they appear in the Excel File
2. WHILE assigning Courses, THE System SHALL respect Working Hours: Monday/Tuesday/Wednesday 9 Class Hours (08:05-11:35, 13:00-17:25), Thursday 8 Class Hours (08:40-11:15, 13:00-17:25), Friday 5 Class Hours (08:40-11:15, 13:00-14:40)
3. WHEN assigning a Course, THE System SHALL ensure that no more than 3 Class Hours of the same Course are scheduled on a single day
3.1. WHEN the same Instructor teaches the same Course, THE System SHALL ensure that no more than 3 consecutive Class Hours are assigned to prevent excessive continuous teaching
3.2. WHEN a Course has '평가' value equal to 1, THE System SHALL automatically schedule a 2-hour exam on the next day after the Course is completed
4. WHEN generating the Schedule, THE System SHALL preserve all Pre-assignment time slots without modification
5. WHEN multiple Instructors teach the same Course, THE System SHALL divide the Class Hours among the Instructors according to their allocated hours
6. THE System SHALL ensure that no two Courses are assigned to the same time slot
7. WHEN an Instructor has an Off Day, THE System SHALL not assign any Course taught by that Instructor on that date
8. THE System SHALL assign Courses consecutively within each day without gaps between Class Hours

### Requirement 4: 교관 휴무일 관리

**User Story:** As an Administrator, I want to manage instructor off days, so that courses are not scheduled when instructors are unavailable

#### Acceptance Criteria

1. THE System SHALL provide an interface for the Administrator to add Off Days for each Instructor
2. WHEN the Administrator adds an Off Day for an Instructor, THE System SHALL store the date and Instructor identifier in the database
3. THE System SHALL allow the Administrator to view all Off Days for a specific Instructor
4. THE System SHALL allow the Administrator to delete an Off Day record
5. WHEN generating or modifying a Schedule, THE System SHALL validate that no Course is assigned to an Instructor on their Off Day

### Requirement 5: 시간표 수동 수정

**User Story:** As an Administrator, I want to manually modify the generated schedule, so that I can make adjustments when needed

#### Acceptance Criteria

1. THE System SHALL allow the Administrator to select any scheduled Course and change its assigned date and time
2. WHEN the Administrator moves a Course to a new time slot, THE System SHALL verify that the new time slot is within Working Hours
3. IF the new time slot conflicts with another Course, THEN THE System SHALL display an error message and prevent the modification
4. WHEN a Course is moved, THE System SHALL update the database to reflect the new schedule
5. THE System SHALL allow the Administrator to delete a scheduled Course from the Schedule

### Requirement 6: 시간표 조회

**User Story:** As an Administrator, I want to view the schedule in monthly, weekly, and daily formats, so that I can review the schedule at different levels of detail

#### Acceptance Criteria

1. THE System SHALL provide a monthly view that displays all scheduled Courses for the selected month in a calendar format
2. THE System SHALL provide a weekly view that displays scheduled Courses for the selected week with Class Hour details
3. THE System SHALL provide a daily view that displays scheduled Courses for the selected day with Class Hour details
4. WHEN displaying weekly or daily views, THE System SHALL show each Course with its assigned Class Hour number (교시)
5. THE System SHALL allow the Administrator to navigate between different months, weeks, and days using navigation controls
6. WHEN displaying any view, THE System SHALL show Course name, Instructor name, and time information for each scheduled item

### Requirement 7: 시간표 출력

**User Story:** As an Administrator, I want to print schedules in a table format by selecting a date range, so that I can have a physical copy of the schedule organized by week

#### Acceptance Criteria

1. THE System SHALL provide a date range selector that allows the Administrator to select start and end dates
2. WHEN the Administrator selects a date range, THE System SHALL display schedules in a table format with rows representing weeks and columns representing weekdays (Monday to Friday)
3. THE System SHALL display the date for each week in the first column
4. WHEN displaying schedules for each day, THE System SHALL show Course name, Instructor name, and period information
5. THE System SHALL provide a print button that triggers the browser's print dialog
6. WHEN printing, THE System SHALL hide UI controls (date selectors, buttons) and show only the schedule table
7. THE System SHALL display evaluation schedules with [평가] prefix to distinguish them from regular courses

### Requirement 8: 시스템 아키텍처

**User Story:** As a Developer, I want the system to follow a client-server architecture with React frontend and Node.js backend, so that the application is maintainable and scalable

#### Acceptance Criteria

1. THE System SHALL implement the frontend as a React-based Single Page Application
2. THE System SHALL implement the backend as a Node.js/Express REST API server
3. THE System SHALL use SQLite database to store all data including Courses, Instructors, Schedules, and Off Days
4. WHEN the frontend needs data, THE System SHALL communicate with the backend through REST API calls
5. THE System SHALL handle Excel file parsing and schedule generation logic in the backend
