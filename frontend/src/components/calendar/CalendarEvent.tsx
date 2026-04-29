import React from 'react';
import { Task } from '../../types';

const PRIORITY_COLORS: Record<string, string> = {
  low: 'var(--priority-low)',
  medium: 'var(--priority-medium)',
  high: 'var(--priority-high)',
  critical: 'var(--priority-critical)',
};

interface CalendarEventProps {
  task: Task;
}

const CalendarEvent = ({ task }: CalendarEventProps) => {
  return (
    <div
      className="calendar-event-pill"
      style={{ '--pill-color': PRIORITY_COLORS[task.priority] || 'var(--priority-low)' } as React.CSSProperties}
      title={`${task.title} (${task.priority})`}
    >
      <span className="event-dot" />
      <span className="event-text">{task.title}</span>
    </div>
  );
};

export default CalendarEvent;
