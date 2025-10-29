import { ExcelParser, ParsedCourse } from './ExcelParser';
import { CourseRepository } from '../repositories/CourseRepository';
import { InstructorRepository } from '../repositories/InstructorRepository';
import { Course } from '../types/models';

/**
 * 업로드 결과
 */
export interface UploadResult {
  success: boolean;
  message: string;
  courseCount: number;
  instructorCount: number;
}

/**
 * 엑셀 파일 업로드 및 데이터 저장을 처리하는 서비스
 */
export class UploadService {
  private courseRepository: CourseRepository;
  private instructorRepository: InstructorRepository;

  constructor() {
    this.courseRepository = new CourseRepository();
    this.instructorRepository = new InstructorRepository();
  }

  /**
   * 엑셀 파일을 파싱하고 데이터베이스에 저장
   * @param buffer 엑셀 파일 버퍼
   * @returns 업로드 결과
   */
  async uploadExcelFile(buffer: Buffer): Promise<UploadResult> {
    // 1. 엑셀 파일 파싱
    const parsedCourses = ExcelParser.parse(buffer);

    if (parsedCourses.length === 0) {
      return {
        success: false,
        message: '엑셀 파일에 데이터가 없습니다',
        courseCount: 0,
        instructorCount: 0
      };
    }

    // 2. 기존 교과목 데이터 삭제 (새로운 업로드로 대체)
    await this.courseRepository.deleteAll();

    // 3. 교관 목록 추출 및 생성
    const instructorNames = new Set<string>();
    for (const course of parsedCourses) {
      // 여러 교관이 쉼표로 구분되어 있을 수 있음
      const instructors = course.담당교관.split(',').map(name => name.trim());
      instructors.forEach(name => instructorNames.add(name));
    }

    // 교관 자동 생성 (이미 존재하면 재사용)
    const instructorMap = new Map<string, number>();
    for (const name of instructorNames) {
      const instructor = await this.instructorRepository.findOrCreate(name);
      instructorMap.set(name, instructor.id);
    }

    // 4. 교과목 데이터 저장
    let savedCourseCount = 0;

    for (const parsedCourse of parsedCourses) {
      // 여러 교관이 있는 경우 처리
      const instructors = parsedCourse.담당교관.split(',').map(name => name.trim());

      if (instructors.length === 1) {
        // 단일 교관: 그대로 저장
        await this.courseRepository.create({
          구분: parsedCourse.구분,
          과목: parsedCourse.과목,
          시수: parsedCourse.시수,
          담당교관: parsedCourse.담당교관,
          선배정: parsedCourse.선배정,
          평가: parsedCourse.평가,
          excel_order: parsedCourse.excel_order
        });
        savedCourseCount++;
      } else {
        // 여러 교관: 각 교관별로 별도 레코드 생성
        // 시수를 교관 수로 나누어 분배
        const hoursPerInstructor = Math.floor(parsedCourse.시수 / instructors.length);
        const remainder = parsedCourse.시수 % instructors.length;

        for (let i = 0; i < instructors.length; i++) {
          const instructorName = instructors[i];
          // 첫 번째 교관에게 나머지 시수 할당
          const allocatedHours = hoursPerInstructor + (i === 0 ? remainder : 0);

          await this.courseRepository.create({
            구분: parsedCourse.구분,
            과목: parsedCourse.과목,
            시수: allocatedHours,
            담당교관: instructorName,
            선배정: parsedCourse.선배정,
            평가: parsedCourse.평가,
            excel_order: parsedCourse.excel_order
          });
          savedCourseCount++;
        }
      }
    }

    return {
      success: true,
      message: '엑셀 파일이 성공적으로 업로드되었습니다',
      courseCount: savedCourseCount,
      instructorCount: instructorNames.size
    };
  }
}
