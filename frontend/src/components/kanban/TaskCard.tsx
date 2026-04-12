/**
 * @module components/kanban/TaskCard
 * @description A single task card for the Kanban board.
 * Renders priority badge, deadline, and assignee avatars.
 * Designed to match the Stitch glassmorphism card mockup.
 */
import { motion } from 'framer-motion';
import { getRelativeTime, isInDeadlineZone, isOverdue } from '../../utils/dateHelpers';
import { Task } from '../../types';
import { DraggableProvided, DraggableStateSnapshot } from '@hello-pangea/dnd';
import './TaskCard.css';

const PRIORITY_LABELS: Record<string, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  critical: 'Critical',
};

interface TaskCardProps {
  task: Task;
  onClick?: (task: Task) => void;
  provided?: DraggableProvided;
  snapshot?: DraggableStateSnapshot;
}

const TaskCard = ({ task, onClick, provided, snapshot }: TaskCardProps) => {
  const deadlineZone = isInDeadlineZone(task.deadline);
  const overdue = isOverdue(task.deadline) && task.status !== 'completed';

  return (
    <motion.div
      className={`task-card ${snapshot?.isDragging ? 'dragging' : ''} ${overdue ? 'overdue' : ''} ${deadlineZone ? 'deadline-zone' : ''}`}
      ref={provided?.innerRef}
      {...(provided?.draggableProps || {})}
      {...(provided?.dragHandleProps ? { ...provided.dragHandleProps, onDragStart: provided.dragHandleProps.onDragStart as unknown as undefined } : {})}
      onClick={() => onClick?.(task)}
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      whileHover={{ y: -2 }}
    >
      {/* Priority stripe */}
      <div className={`task-card-stripe priority-${task.priority}`} />

      <div className="task-card-content">
        {/* Header row */}
        <div className="task-card-header">
          <span className={`badge badge-${task.priority}`}>
            <span className={`priority-dot priority-${task.priority}`} />
            {PRIORITY_LABELS[task.priority]}
          </span>
          {task.visibility === 'public' && (
            <span className="badge" style={{ background: 'rgba(192,193,255,0.1)', color: 'var(--primary)' }}>
              Public
            </span>
          )}
        </div>

        {/* Title */}
        <h4 className="task-card-title">{task.title}</h4>

        {/* Description preview */}
        {task.description && (
          <p className="task-card-desc">{task.description.slice(0, 80)}{task.description.length > 80 ? '…' : ''}</p>
        )}

        {/* Footer */}
        <div className="task-card-footer">
          <div className="task-card-deadline">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
            </svg>
            <span className={overdue ? 'text-error' : deadlineZone ? 'text-warning' : ''}>
              {getRelativeTime(task.deadline)}
            </span>
          </div>

          {/* Assignee avatars */}
          {task.accessList && task.accessList.length > 0 && (
            <div className="avatar-stack">
              {task.accessList.slice(0, 3).map((user) => (
                <div key={user.id} className="avatar avatar-sm" title={user.username}>
                  {user.username.slice(0, 2).toUpperCase()}
                </div>
              ))}
              {task.accessList.length > 3 && (
                <div className="avatar avatar-sm" style={{ background: 'var(--surface-container-highest)' }}>
                  +{task.accessList.length - 3}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default TaskCard;
