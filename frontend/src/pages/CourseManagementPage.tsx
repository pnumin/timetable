import { useState, useEffect } from 'react';
import { Course, courseService, CreateCourseRequest, UpdateCourseRequest } from '../services/courseService';
import { showError, showSuccess } from '../utils/errorHandler';
import './CourseManagementPage.css';

export function CourseManagementPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPreAssignment, setFilterPreAssignment] = useState<'all' | '1' | '2'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [formData, setFormData] = useState<CreateCourseRequest>({
    구분: '',
    과목: '',
    시수: 1,
    담당교관: '',
    선배정: 1,
    평가: '',
    excel_order: 999
  });

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      setLoading(true);
      const data = await courseService.getAllCourses();
      setCourses(data);
    } catch (error) {
      showError(error, '교과목 목록 로드 실패');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingCourse(null);
    setFormData({
      구분: '',
      과목: '',
      시수: 1,
      담당교관: '',
      선배정: 1,
      평가: '',
      excel_order: 999
    });
    setIsModalOpen(true);
  };

  const handleEdit = (course: Course) => {
    setEditingCourse(course);
    setFormData({
      구분: course.구분,
      과목: course.과목,
      시수: course.시수,
      담당교관: course.담당교관,
      선배정: course.선배정,
      평가: course.평가,
      excel_order: course.excel_order
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (course: Course) => {
    if (!confirm(`"${course.과목}" 교과목을 삭제하시겠습니까?`)) {
      return;
    }

    try {
      await courseService.deleteCourse(course.id);
      showSuccess('교과목이 삭제되었습니다.');
      await loadCourses();
    } catch (error) {
      showError(error, '교과목 삭제 실패');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingCourse) {
        await courseService.updateCourse(editingCourse.id, formData);
        showSuccess('교과목이 수정되었습니다.');
      } else {
        await courseService.createCourse(formData);
        showSuccess('교과목이 추가되었습니다.');
      }
      setIsModalOpen(false);
      await loadCourses();
    } catch (error) {
      showError(error, editingCourse ? '교과목 수정 실패' : '교과목 추가 실패');
    }
  };

  const filteredCourses = courses.filter(course => {
    const matchesSearch = 
      course.과목.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.구분.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.담당교관.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = 
      filterPreAssignment === 'all' || 
      course.선배정.toString() === filterPreAssignment;

    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="course-management-page">
        <div className="loading">교과목 목록을 불러오는 중...</div>
      </div>
    );
  }

  return (
    <div className="course-management-page">
      <div className="page-header">
        <h2>교과목 관리</h2>
        <p>교과목을 추가, 수정, 삭제할 수 있습니다.</p>
      </div>

      <div className="toolbar">
        <div className="search-filter">
          <input
            type="text"
            placeholder="교과목, 구분, 교관 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <select
            value={filterPreAssignment}
            onChange={(e) => setFilterPreAssignment(e.target.value as 'all' | '1' | '2')}
            className="filter-select"
          >
            <option value="all">전체</option>
            <option value="1">선배정</option>
            <option value="2">자동배정</option>
          </select>
        </div>
        <button className="btn btn-primary" onClick={handleAdd}>
          + 교과목 추가
        </button>
      </div>

      <div className="course-table-container">
        <table className="course-table">
          <thead>
            <tr>
              <th>순서</th>
              <th>구분</th>
              <th>과목</th>
              <th>시수</th>
              <th>담당교관</th>
              <th>선배정</th>
              <th>평가</th>
              <th>작업</th>
            </tr>
          </thead>
          <tbody>
            {filteredCourses.length === 0 ? (
              <tr>
                <td colSpan={8} className="empty-message">
                  {searchTerm || filterPreAssignment !== 'all' 
                    ? '검색 결과가 없습니다.' 
                    : '등록된 교과목이 없습니다.'}
                </td>
              </tr>
            ) : (
              filteredCourses.map((course) => (
                <tr key={course.id}>
                  <td>{course.excel_order}</td>
                  <td>{course.구분}</td>
                  <td className="course-name">{course.과목}</td>
                  <td>{course.시수}시간</td>
                  <td>{course.담당교관}</td>
                  <td>
                    <span className={`badge ${course.선배정 === 1 ? 'badge-primary' : 'badge-success'}`}>
                      {course.선배정 === 1 ? '선배정' : '자동'}
                    </span>
                  </td>
                  <td>{course.평가}</td>
                  <td className="actions">
                    <button 
                      className="btn-icon btn-edit" 
                      onClick={() => handleEdit(course)}
                      title="수정"
                    >
                      ✏️
                    </button>
                    <button 
                      className="btn-icon btn-delete" 
                      onClick={() => handleDelete(course)}
                      title="삭제"
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="summary">
        총 {filteredCourses.length}개 교과목 (전체: {courses.length}개)
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingCourse ? '교과목 수정' : '교과목 추가'}</h3>
              <button className="modal-close" onClick={() => setIsModalOpen(false)}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-row">
                  <div className="form-group">
                    <label>구분 *</label>
                    <input
                      type="text"
                      value={formData.구분}
                      onChange={(e) => setFormData({ ...formData, 구분: e.target.value })}
                      required
                      placeholder="예: 공통"
                    />
                  </div>
                  <div className="form-group">
                    <label>순서</label>
                    <input
                      type="number"
                      value={formData.excel_order}
                      onChange={(e) => setFormData({ ...formData, excel_order: parseInt(e.target.value) })}
                      min="1"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>과목명 *</label>
                  <input
                    type="text"
                    value={formData.과목}
                    onChange={(e) => setFormData({ ...formData, 과목: e.target.value })}
                    required
                    placeholder="예: 전투체력"
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>시수 *</label>
                    <input
                      type="number"
                      value={formData.시수}
                      onChange={(e) => setFormData({ ...formData, 시수: parseInt(e.target.value) })}
                      required
                      min="1"
                    />
                  </div>
                  <div className="form-group">
                    <label>선배정 *</label>
                    <select
                      value={formData.선배정}
                      onChange={(e) => setFormData({ ...formData, 선배정: parseInt(e.target.value) as 1 | 2 })}
                      required
                    >
                      <option value="1">선배정</option>
                      <option value="2">자동배정</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>담당교관 *</label>
                  <input
                    type="text"
                    value={formData.담당교관}
                    onChange={(e) => setFormData({ ...formData, 담당교관: e.target.value })}
                    required
                    placeholder="예: 홍길동"
                  />
                </div>

                <div className="form-group">
                  <label>평가 *</label>
                  <input
                    type="text"
                    value={formData.평가}
                    onChange={(e) => setFormData({ ...formData, 평가: e.target.value })}
                    required
                    placeholder="예: 수행평가"
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
                  취소
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingCourse ? '수정' : '추가'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
