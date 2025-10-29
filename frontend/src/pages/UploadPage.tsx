import { useState } from 'react';
import { apiClient, handleApiCall } from '../services/api';
import { Course } from '../types/models';
import { showError, showSuccess } from '../utils/errorHandler';
import './UploadPage.css';

interface UploadResult {
  success: boolean;
  message: string;
  courseCount: number;
  instructorCount: number;
}

type UploadStatus = 'idle' | 'uploading' | 'success' | 'error';

export function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>('idle');
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      // 파일 형식 검증
      const validExtensions = ['.xlsx', '.xls'];
      const fileExtension = selectedFile.name.substring(selectedFile.name.lastIndexOf('.')).toLowerCase();
      
      if (!validExtensions.includes(fileExtension)) {
        const errorMsg = '엑셀 파일(.xlsx, .xls)만 업로드 가능합니다';
        setErrorMessage(errorMsg);
        showError(errorMsg);
        setFile(null);
        return;
      }

      setFile(selectedFile);
      setErrorMessage('');
      setUploadStatus('idle');
      setUploadResult(null);
      setCourses([]);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      const errorMsg = '파일을 선택해주세요';
      setErrorMessage(errorMsg);
      showError(errorMsg);
      return;
    }

    setUploadStatus('uploading');
    setErrorMessage('');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await handleApiCall(
        apiClient.post<UploadResult>('/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        })
      );

      setUploadResult(response.data);
      setUploadStatus('success');
      showSuccess(response.data.message || '파일이 성공적으로 업로드되었습니다.');

      // 업로드 성공 후 교과목 목록 조회
      await fetchCourses();
    } catch (error: any) {
      setUploadStatus('error');
      const message = error.message || '파일 업로드 중 오류가 발생했습니다';
      setErrorMessage(message);
      showError(error, '파일 업로드');
    }
  };

  const fetchCourses = async () => {
    try {
      const response = await handleApiCall(
        apiClient.get<{ courses: Course[] }>('/courses')
      );
      setCourses(response.data.courses || []);
    } catch (error: any) {
      console.error('Failed to fetch courses:', error);
      showError(error, '교과목 목록 조회');
    }
  };

  const handleReset = () => {
    setFile(null);
    setUploadStatus('idle');
    setUploadResult(null);
    setCourses([]);
    setErrorMessage('');
  };

  const totalHours = courses.reduce((sum, course) => sum + course.시수, 0);

  return (
    <div className="upload-page">
      <h2>📤 엑셀 파일 업로드</h2>
      <p className="description">
        교과목 정보가 담긴 엑셀 파일을 업로드하세요. 
        파일에는 '구분', '과목', '시수', '담당교관', '선배정', '평가' 컬럼이 포함되어야 합니다.
      </p>

      <div className="upload-section">
        <div className="file-input-wrapper">
          <input
            type="file"
            id="file-input"
            accept=".xlsx,.xls"
            onChange={handleFileSelect}
            disabled={uploadStatus === 'uploading'}
            className="file-input"
          />
          <label htmlFor="file-input" className="file-input-label">
            {file ? file.name : '파일 선택'}
          </label>
        </div>

        <button
          onClick={handleUpload}
          disabled={!file || uploadStatus === 'uploading'}
          className="upload-button"
        >
          {uploadStatus === 'uploading' ? '업로드 중...' : '업로드'}
        </button>

        {uploadStatus !== 'idle' && (
          <button onClick={handleReset} className="reset-button">
            초기화
          </button>
        )}
      </div>

      {uploadStatus === 'uploading' && (
        <div className="status-message uploading">
          <div className="spinner"></div>
          <span>파일을 업로드하고 있습니다...</span>
        </div>
      )}

      {uploadStatus === 'success' && uploadResult && (
        <div className="status-message success">
          <span className="icon">✓</span>
          <div>
            <strong>{uploadResult.message}</strong>
            <p>교과목 {uploadResult.courseCount}개, 교관 {uploadResult.instructorCount}명이 등록되었습니다.</p>
          </div>
        </div>
      )}

      {uploadStatus === 'error' && errorMessage && (
        <div className="status-message error">
          <span className="icon">✗</span>
          <div>
            <strong>업로드 실패</strong>
            <p>{errorMessage}</p>
          </div>
        </div>
      )}

      {errorMessage && uploadStatus === 'idle' && (
        <div className="status-message error">
          <span className="icon">✗</span>
          <span>{errorMessage}</span>
        </div>
      )}

      {courses.length > 0 && (
        <div className="preview-section">
          <h3>📋 업로드된 교과목 목록</h3>
          
          <div className="summary-info">
            <div className="summary-item">
              <span className="summary-label">총 교과목 수:</span>
              <span className="summary-value">{courses.length}개</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">총 시수:</span>
              <span className="summary-value">{totalHours}시간</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">선배정 대상:</span>
              <span className="summary-value">
                {courses.filter(c => c.선배정 === 1).length}개
              </span>
            </div>
            <div className="summary-item">
              <span className="summary-label">자동 배정 대상:</span>
              <span className="summary-value">
                {courses.filter(c => c.선배정 === 2).length}개
              </span>
            </div>
          </div>

          <div className="table-wrapper">
            <table className="courses-table">
              <thead>
                <tr>
                  <th>순서</th>
                  <th>구분</th>
                  <th>과목</th>
                  <th>시수</th>
                  <th>담당교관</th>
                  <th>선배정</th>
                  <th>평가</th>
                </tr>
              </thead>
              <tbody>
                {courses.map((course) => (
                  <tr key={course.id}>
                    <td>{course.excel_order}</td>
                    <td>{course.구분}</td>
                    <td>{course.과목}</td>
                    <td>{course.시수}</td>
                    <td>{course.담당교관}</td>
                    <td>
                      <span className={`badge ${course.선배정 === 1 ? 'pre-assign' : 'auto-assign'}`}>
                        {course.선배정 === 1 ? '선배정' : '자동'}
                      </span>
                    </td>
                    <td>{course.평가}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
