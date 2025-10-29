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
  date: string; // YYYY-MM-DD
  start_period: number; // 1-9
  end_period: number; // 1-9
  is_pre_assigned: boolean;
  created_at: string;
  // Joined data
  course?: Course;
  instructor?: Instructor;
}

export interface OffDay {
  id: number;
  instructor_id: number;
  date: string; // YYYY-MM-DD
  created_at: string;
  instructor?: Instructor;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  details?: any;
}
