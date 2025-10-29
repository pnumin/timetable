import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import './TimeSlotModal.css';

interface TimeSlotModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (startPeriod: number, endPeriod: number) => void;
  selectedDate: Date | null;
  requiredHours: number;
  courseName: string;
  assignedHours?: number;
}

// 요일별 최대 교시 수
const MAX_PERIODS_BY_DAY: { [key: number]: number } = {
  1: 9, // 월요일
  2: 9, // 화요일
  3: 9, // 수요일
  4: 8, // 목요일
  5: 5, // 금요일
};

// 교시별 시간 정보
const PERIOD_TIMES: { [key: number]: { start: string; end: string } } = {
  1: { start: '08:05', end: '08:50' },
  2: { start: '08:55', end: '09:40' },
  3: { start: '09:45', end: '10:30' },
  4: { start: '10:35', end: '11:20' },
  5: { start: '13:00', end: '13:45' },
  6: { start: '13:50', end: '14:35' },
  7: { start: '14:40', end: '15:25' },
  8: { start: '15:30', end: '16:15' },
  9: { start: '16:20', end: '17:05' },
};

// 목요일 교시 시간 (다름)
const THURSDAY_PERIOD_TIMES: { [key: number]: { start: string; end: string } } = {
  1: { start: '08:40', end: '09:25' },
  2: { start: '09:30', end: '10:15' },
  3: { start: '10:20', end: '11:05' },
  4: { start: '13:00', end: '13:45' },
  5: { start: '13:50', end: '14:35' },
  6: { start: '14:40', end: '15:25' },
  7: { start: '15:30', end: '16:15' },
  8: { start: '16:20', end: '17:05' },
};

// 금요일 교시 시간 (목요일과 동일하지만 5교시까지만)
const FRIDAY_PERIOD_TIMES: { [key: number]: { start: string; end: string } } = {
  1: { start: '08:40', end: '09:25' },
  2: { start: '09:30', end: '10:15' },
  3: { start: '10:20', end: '11:05' },
  4: { start: '13:00', end: '13:45' },
  5: { start: '13:50', end: '14:35' },
};

export function TimeSlotModal({
  isOpen,
  onClose,
  onConfirm,
  selectedDate,
  requiredHours,
  courseName,
  assignedHours = 0
}: TimeSlotModalProps) {
  const [startPeriod, setStartPeriod] = useState<number>(1);
  const [endPeriod, setEndPeriod] = useState<number>(1);
  const [error, setError] = useState<string>('');

  const remainingHours = requiredHours - assignedHours;

  useEffect(() => {
    if (isOpen && selectedDate) {
      // Reset to default values
      // 남은 시수만큼 기본 선택
      const defaultStart = 1;
      const defaultEnd = Math.min(defaultStart + remainingHours - 1, defaultStart + requiredHours - 1);
      setStartPeriod(defaultStart);
      setEndPeriod(defaultEnd);
      setError('');
    }
  }, [isOpen, selectedDate, requiredHours, remainingHours]);

  if (!isOpen || !selectedDate) return null;

  // Use local date to avoid timezone issues
  const localDate = new Date(selectedDate.getTime() - selectedDate.getTimezoneOffset() * 60000);
  const dayOfWeek = localDate.getDay();
  
  // Check if it's weekend
  if (dayOfWeek === 0 || dayOfWeek === 6) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h3>시간대 선택</h3>
            <button className="modal-close" onClick={onClose}>×</button>
          </div>
          <div className="modal-body">
            <div className="error-message">
              주말에는 일과시간이 없습니다. 평일을 선택해주세요.
            </div>
          </div>
          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={onClose}>
              닫기
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  const maxPeriods = MAX_PERIODS_BY_DAY[dayOfWeek] || 9;

  // Check if remaining hours exceed max periods for the day
  if (remainingHours > maxPeriods) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h3>시간대 선택</h3>
            <button className="modal-close" onClick={onClose}>×</button>
          </div>
          <div className="modal-body">
            <div className="error-message">
              <p><strong>{courseName}</strong> 교과목의 남은 시수는 {remainingHours}시간이지만,</p>
              <p>선택한 날짜의 최대 교시는 {maxPeriods}교시입니다.</p>
              <p className="hint">다른 날짜를 선택하거나 여러 날에 나누어 배정해주세요.</p>
            </div>
          </div>
          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={onClose}>
              닫기
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Check if all hours are already assigned
  if (remainingHours <= 0) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h3>시간대 선택</h3>
            <button className="modal-close" onClick={onClose}>×</button>
          </div>
          <div className="modal-body">
            <div className="error-message">
              <p><strong>{courseName}</strong> 교과목의 모든 시수가 이미 배정되었습니다.</p>
              <p>총 시수: {requiredHours}시간, 배정된 시수: {assignedHours}시간</p>
            </div>
          </div>
          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={onClose}>
              닫기
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Get period times based on day of week
  const getPeriodTimes = (period: number) => {
    if (dayOfWeek === 4) {
      return THURSDAY_PERIOD_TIMES[period];
    } else if (dayOfWeek === 5) {
      return FRIDAY_PERIOD_TIMES[period];
    } else {
      return PERIOD_TIMES[period];
    }
  };

  const handleStartPeriodChange = (value: number) => {
    setStartPeriod(value);
    // Auto-adjust end period (don't exceed remaining hours or max periods)
    const newEndPeriod = Math.min(value + remainingHours - 1, maxPeriods);
    setEndPeriod(newEndPeriod);
    validateSelection(value, newEndPeriod);
  };

  const handleEndPeriodChange = (value: number) => {
    setEndPeriod(value);
    validateSelection(startPeriod, value);
  };

  const validateSelection = (start: number, end: number) => {
    // 시작 교시와 종료 교시 기본 검증
    if (start > end) {
      setError('시작 교시가 종료 교시보다 클 수 없습니다.');
      return false;
    }
    
    if (start < 1 || end > maxPeriods) {
      setError(`선택한 교시가 일과시간을 벗어났습니다. (1-${maxPeriods}교시)`);
      return false;
    }
    
    const selectedHours = end - start + 1;
    
    if (selectedHours <= 0) {
      setError('최소 1시간 이상 선택해야 합니다.');
      return false;
    }
    
    // 남은 시수를 초과하는지 확인
    if (selectedHours > remainingHours) {
      setError(`선택한 시간이 남은 시수(${remainingHours}시간)를 초과합니다.`);
      return false;
    }
    
    // 모든 검증 통과
    setError('');
    return true;
  };

  const handleConfirm = () => {
    if (validateSelection(startPeriod, endPeriod)) {
      onConfirm(startPeriod, endPeriod);
    }
  };

  const selectedHours = endPeriod - startPeriod + 1;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>시간대 선택</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <div className="modal-body">
          <div className="modal-info">
            <div className="info-item">
              <span className="info-label">과목:</span>
              <span className="info-value">{courseName}</span>
            </div>
            <div className="info-item">
              <span className="info-label">날짜:</span>
              <span className="info-value">{format(selectedDate, 'yyyy-MM-dd (EEE)', { locale: undefined })}</span>
            </div>
            <div className="info-item">
              <span className="info-label">총 시수:</span>
              <span className="info-value">{requiredHours}시간</span>
            </div>
            {assignedHours > 0 && (
              <>
                <div className="info-item">
                  <span className="info-label">배정된 시수:</span>
                  <span className="info-value assigned">{assignedHours}시간</span>
                </div>
                <div className="info-item">
                  <span className="info-label">남은 시수:</span>
                  <span className="info-value remaining">{remainingHours}시간</span>
                </div>
              </>
            )}
          </div>

          <div className="period-selection">
            <div className="period-input-group">
              <label>시작 교시</label>
              <select 
                value={startPeriod} 
                onChange={(e) => handleStartPeriodChange(Number(e.target.value))}
                className="period-select"
              >
                {Array.from({ length: maxPeriods }, (_, i) => i + 1).map(period => {
                  const times = getPeriodTimes(period);
                  return (
                    <option key={period} value={period}>
                      {period}교시 ({times?.start || ''})
                    </option>
                  );
                })}
              </select>
            </div>

            <div className="period-separator">→</div>

            <div className="period-input-group">
              <label>종료 교시</label>
              <select 
                value={endPeriod} 
                onChange={(e) => handleEndPeriodChange(Number(e.target.value))}
                className="period-select"
              >
                {Array.from({ length: maxPeriods }, (_, i) => i + 1).map(period => {
                  const times = getPeriodTimes(period);
                  return (
                    <option key={period} value={period}>
                      {period}교시 ({times?.end || ''})
                    </option>
                  );
                })}
              </select>
            </div>
          </div>

          <div className="selection-summary">
            <div className={`summary-box ${!error && selectedHours > 0 && selectedHours <= remainingHours ? 'valid' : 'invalid'}`}>
              <span>선택된 시간: {selectedHours}시간</span>
              {!error && selectedHours > 0 && selectedHours <= remainingHours ? (
                <span className="check-icon">✓</span>
              ) : (
                <span className="warning-icon">⚠</span>
              )}
            </div>
            {assignedHours > 0 && selectedHours <= remainingHours && (
              <div className="remaining-info">
                배정 후 남은 시수: {remainingHours - selectedHours}시간
              </div>
            )}
          </div>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            취소
          </button>
          <button 
            className="btn btn-primary" 
            onClick={handleConfirm}
            disabled={!!error}
          >
            배정하기
          </button>
        </div>
      </div>
    </div>
  );
}
