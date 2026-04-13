import { motion } from 'framer-motion';
import CalendarEvent from './CalendarEvent';
import { Task } from '../../types';

const DAY_NAMES = ['Lun', 'Mar', 'Mie', 'Joi', 'Vin', 'Sâm', 'Dum'];

interface CalendarViewProps {
  calendarDays: Date[];
  tasksByDate: Record<string, Task[]>;
  month: number;
  todayKey: string;
}

const CalendarView = ({ calendarDays, tasksByDate, month, todayKey }: CalendarViewProps) => {
  return (
    <div className="calendar-grid-container">
      {/* Day headers */}
      <div className="calendar-header-row">
        {DAY_NAMES.map((day) => (
          <div key={day} className="calendar-header-cell label-md">
            {day}
          </div>
        ))}
      </div>

      {/* Day cells */}
      <div className="calendar-grid">
        {calendarDays.map((day, index) => {
          const dateKey = day.toISOString().split('T')[0];
          const dayTasks = tasksByDate[dateKey] || [];
          const isCurrentMonth = day.getMonth() === month;
          const isToday = dateKey === todayKey;

          return (
            <motion.div
              key={index}
              className={`calendar-cell ${!isCurrentMonth ? 'other-month' : ''} ${isToday ? 'today' : ''}`}
              whileHover={{ background: 'rgba(192, 193, 255, 0.04)' }}
            >
              <span className={`calendar-day-number ${isToday ? 'today-ring' : ''}`}>
                {day.getDate()}
              </span>

              <div className="calendar-events">
                {dayTasks.slice(0, 3).map((task) => (
                  <CalendarEvent key={task.id} task={task} />
                ))}
                {dayTasks.length > 3 && (
                  <span className="calendar-more">+{dayTasks.length - 3} mai multe</span>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default CalendarView;
