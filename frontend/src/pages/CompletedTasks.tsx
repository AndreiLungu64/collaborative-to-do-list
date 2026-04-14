import { useState } from 'react';
import Navbar from '../components/common/Navbar';
import TaskCard from '../components/kanban/TaskCard';
import TaskDetail from '../components/tasks/TaskDetail';
import Loader from '../components/common/Loader';
import { useTasks } from '../hooks/useTasks';
import { Task } from '../types';
import './CompletedTasks.css';

const CompletedTasks = () => {
  const { tasks, loading } = useTasks();
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  // Filter tasks locally to just show completed ones
  const completedTasks = tasks.filter((t) => t.status === 'completed');

  return (
    <div className="completed-tasks-page">
      <Navbar />

      <div className="completed-tasks-content">
        <h2 className="headline-md" style={{ marginBottom: '1.5rem', color: 'var(--text-primary)' }}>
          Task-uri Finalizate ({completedTasks.length})
        </h2>

        {loading ? (
          <Loader fullScreen />
        ) : (
          <div className="completed-tasks-grid">
            {completedTasks.length > 0 ? (
              completedTasks.map((task) => (
                <TaskCard key={task.id} task={task} onClick={setSelectedTask} />
              ))
            ) : (
              <p style={{ color: 'var(--text-secondary)' }}>Nu există task-uri finalizate încă.</p>
            )}
          </div>
        )}
      </div>

      {selectedTask && (
        <TaskDetail task={selectedTask} onClose={() => setSelectedTask(null)} />
      )}
    </div>
  );
};

export default CompletedTasks;
