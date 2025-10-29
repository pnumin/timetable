import { apiClient, handleApiCall } from './api';
import { Schedule } from './courseService';

export interface PreAssignmentRequest {
  courseId: number;
  instructorId: number;
  date: string;
  startPeriod: number;
  endPeriod: number;
}

export interface ScheduleQueryParams {
  startDate?: string;
  endDate?: string;
}

export interface GenerateScheduleRequest {
  startDate: string;
}

export interface GenerateScheduleResult {
  success: boolean;
  message: string;
  scheduleCount?: number;
  errors?: string[];
}

export const scheduleService = {
  /**
   * 시간표 자동 생성
   */
  async generateSchedule(startDate: string): Promise<GenerateScheduleResult> {
    return handleApiCall(
      apiClient.post('/generate-schedule', { startDate }).then(res => res.data)
    );
  },

  /**
   * 선배정 일정 생성
   */
  async createPreAssignment(data: PreAssignmentRequest): Promise<Schedule> {
    return handleApiCall(
      apiClient.post('/schedules', data).then(res => res.data.schedule)
    );
  },

  /**
   * 시간표 조회
   */
  async getSchedules(params?: ScheduleQueryParams): Promise<Schedule[]> {
    const queryString = params 
      ? `?${new URLSearchParams(params as any).toString()}`
      : '';
    return handleApiCall(
      apiClient.get(`/schedules${queryString}`).then(res => res.data.schedules)
    );
  },

  /**
   * 교관별 시간표 조회
   */
  async getSchedulesByInstructor(
    instructorId: number,
    startDate?: string,
    endDate?: string
  ): Promise<Schedule[]> {
    const params: any = { instructorId };
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    
    const queryString = new URLSearchParams(params).toString();
    return handleApiCall(
      apiClient.get(`/schedules?${queryString}`).then(res => res.data.schedules)
    );
  },

  /**
   * 시간표 수정
   */
  async updateSchedule(id: number, data: { date: string; startPeriod: number; endPeriod: number }): Promise<Schedule> {
    return handleApiCall(
      apiClient.put(`/schedules/${id}`, data).then(res => res.data.schedule)
    );
  },

  /**
   * 시간표 삭제
   */
  async deleteSchedule(id: number): Promise<void> {
    return handleApiCall(
      apiClient.delete(`/schedules/${id}`).then(res => res.data)
    );
  }
};
