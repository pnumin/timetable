import { apiClient, handleApiCall } from './api';

export interface Course {
  id: number;
  구분: string;
  과목: string;
  시수: number;
  담당교관: string;
  선배정: 1 | 2;
  평가: string;
  excel_order: number;
  created_at: string;
}

export interface Instructor {
  id: number;
  name: string;
  created_at: string;
}

export interface Schedule {
  id: number;
  course_id: number;
  instructor_id: number;
  date: string;
  start_period: number;
  end_period: number;
  is_pre_assigned: boolean;
  is_exam: boolean;
  created_at: string;
  course?: Course;
  instructor?: Instructor;
}

export interface CreateCourseRequest {
  구분: string;
  과목: string;
  시수: number;
  담당교관: string;
  선배정: 1 | 2;
  평가: string;
  excel_order?: number;
}

export interface UpdateCourseRequest {
  구분?: string;
  과목?: string;
  시수?: number;
  담당교관?: string;
  선배정?: 1 | 2;
  평가?: string;
  excel_order?: number;
}

export const courseService = {
  /**
   * 선배정 값으로 필터링된 교과목 목록 조회
   */
  async getCoursesByPreAssignment(preAssignment: 1 | 2): Promise<Course[]> {
    return handleApiCall(
      apiClient.get(`/courses?preAssignment=${preAssignment}`).then(res => res.data.courses)
    );
  },

  /**
   * 모든 교과목 조회
   */
  async getAllCourses(): Promise<Course[]> {
    return handleApiCall(
      apiClient.get('/courses').then(res => res.data.courses)
    );
  },

  /**
   * 특정 교과목 조회
   */
  async getCourseById(id: number): Promise<Course> {
    return handleApiCall(
      apiClient.get(`/courses/${id}`).then(res => res.data.course)
    );
  },

  /**
   * 교과목 추가
   */
  async createCourse(data: CreateCourseRequest): Promise<Course> {
    return handleApiCall(
      apiClient.post('/courses', data).then(res => res.data.course)
    );
  },

  /**
   * 교과목 수정
   */
  async updateCourse(id: number, data: UpdateCourseRequest): Promise<Course> {
    return handleApiCall(
      apiClient.put(`/courses/${id}`, data).then(res => res.data.course)
    );
  },

  /**
   * 교과목 삭제
   */
  async deleteCourse(id: number): Promise<void> {
    return handleApiCall(
      apiClient.delete(`/courses/${id}`).then(() => undefined)
    );
  }
};
