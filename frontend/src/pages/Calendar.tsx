/**
 * @module pages/Calendar
 * @description Calendar view matching the Stitch "TaskFlow Calendar" design.
 * Monthly grid with color-coded task pills by priority.
 */
import { useState, useEffect, useMemo } from 'react';
import Navbar from '../components/common/Navbar';
import api from '../services/api';
import { getCalendarDays, getMonthRange } from '../utils/dateHelpers';
import { Task } from '../types';
import Button from '../components/common/Button';
import CalendarView from '../components/calendar/CalendarView';
import './Calendar.css';

const MONTH_NAMES = [
  'Ianuarie', 'Februarie', 'Martie', 'Aprilie', 'Mai', 'Iunie',
  'Iulie', 'August', 'Septembrie', 'Octombrie', 'Noiembrie', 'Decembrie'
];

type ViewType = 'month' | 'week' | 'day';

const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [tasks, setTasks] = useState<Task[]>([]);
  const [view, setView] = useState<ViewType>('month');
  const [_loading, setLoading] = useState(false);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Fetch tasks for current month range
  useEffect(() => {
    const fetchCalendarTasks = async () => {
      setLoading(true);
      try {
        const { start, end } = getMonthRange(year, month);
        const res = await api.get('/tasks/calendar', {
          params: {
            start: start.toISOString(),
            end: end.toISOString(),
          },
        });
        setTasks(res.data);
      } catch (_err) {
        // Silently handle — tasks just won't show
      } finally {
        setLoading(false);
      }
    };
    fetchCalendarTasks();
  }, [year, month]);

  // Calendar grid days
  const calendarDays = useMemo(() => getCalendarDays(year, month), [year, month]);

  // Group tasks by date (YYYY-MM-DD key)
  const tasksByDate = useMemo(() => {
    const map: Record<string, Task[]> = {};
    tasks.forEach((task) => {
      const dateKey = new Date(task.deadline).toISOString().split('T')[0];
      if (!map[dateKey]) map[dateKey] = [];
      map[dateKey].push(task);
    });
    return map;
  }, [tasks]);

  const goToPrev = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const goToNext = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const today = new Date();
  const todayKey = today.toISOString().split('T')[0];

  return (
    <div className="calendar-page">
      <Navbar />

      {/* Calendar Toolbar */}
      <div className="calendar-toolbar">
        <div className="toolbar-inner">
          <div className="calendar-nav">
            <Button variant="secondary" size="sm" onClick={goToPrev} id="prev-month-btn">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </Button>
            <h2 className="headline-md calendar-month-title">
              {MONTH_NAMES[month]} {year}
            </h2>
            <Button variant="secondary" size="sm" onClick={goToNext} id="next-month-btn">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </Button>
          </div>

          <div className="calendar-actions">
            <Button variant="ghost" size="sm" onClick={goToToday}>Azi</Button>
            <div className="view-toggle">
              {(['month', 'week', 'day'] as ViewType[]).map((v) => (
                <button
                  key={v}
                  className={`view-toggle-btn ${view === v ? 'active' : ''}`}
                  onClick={() => setView(v)}
                >
                  {v === 'month' ? 'Lună' : v === 'week' ? 'Săptămână' : 'Zi'}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <CalendarView
        calendarDays={calendarDays}
        tasksByDate={tasksByDate}
        month={month}
        todayKey={todayKey}
      />
    </div>
  );
};

export default Calendar;
