import Modal from '../common/Modal';
import { Task } from '../../types';

interface TaskDetailProps {
  task: Task;
  onClose: () => void;
}

const TaskDetail = ({ task, onClose }: TaskDetailProps) => {
  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title={task.title}
      className="task-detail"
    >
      <div className="task-detail-body">
        <div className="task-detail-row">
          <span className="label-md">Status</span>
          <span className={`badge badge-${task.status === 'overdue' ? 'critical' : 'low'}`}>
            {task.status}
          </span>
        </div>
        <div className="task-detail-row">
          <span className="label-md">Prioritate</span>
          <span className={`badge badge-${task.priority}`}>
            {task.priority}
          </span>
        </div>
        <div className="task-detail-row">
          <span className="label-md">Vizibilitate</span>
          <span>{task.visibility}</span>
        </div>
        <div className="task-detail-row">
          <span className="label-md">Deadline</span>
          <span>{new Date(task.deadline).toLocaleString('ro-RO')}</span>
        </div>
        {task.description && (
          <div className="task-detail-desc">
            <span className="label-md">Descriere</span>
            <p>{task.description}</p>
          </div>
        )}
        {task.admin_username && (
          <div className="task-detail-row">
            <span className="label-md">Creat de</span>
            <div className="flex items-center gap-2">
              <div className="avatar avatar-sm">
                {task.admin_username.slice(0, 2).toUpperCase()}
              </div>
              <span>{task.admin_username}</span>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default TaskDetail;
