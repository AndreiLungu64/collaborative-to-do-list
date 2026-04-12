/**
 * @module pages/Dashboard
 * @description Main dashboard with Kanban Board.
 * 5 columns: To Do, In Progress, Deadline Zone, Completed, Overdue.
 * Supports drag-and-drop via @hello-pangea/dnd.
 */
import { useState, useMemo, ChangeEvent } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { AnimatePresence } from 'framer-motion';
import Navbar from '../components/common/Navbar';
import Button from '../components/common/Button';
import Loader from '../components/common/Loader';
import Modal from '../components/common/Modal';
import TaskCard from '../components/kanban/TaskCard';
import TaskForm from '../components/tasks/TaskForm';
import { useTasks } from '../hooks/useTasks';
import { isInDeadlineZone, isOverdue } from '../utils/dateHelpers';
import { Task, TaskFormData } from '../types';
import toast from 'react-hot-toast';
import './Dashboard.css';

interface ColumnDef {
  id: string;
  title: string;
  icon: string;
  color: string;
}

const COLUMNS: ColumnDef[] = [
  { id: 'todo', title: 'To Do', icon: '📋', color: 'var(--status-todo)' },
  { id: 'in_progress', title: 'In Progress', icon: '🔄', color: 'var(--status-in-progress)' },
  { id: 'deadline_zone', title: 'Deadline Zone', icon: '⚠️', color: 'var(--status-deadline-zone)' },
  { id: 'completed', title: 'Completed', icon: '✅', color: 'var(--status-completed)' },
  { id: 'overdue', title: 'Overdue', icon: '🔴', color: 'var(--status-overdue)' },
];

const Dashboard = () => {
  const { tasks, loading, createTask, changeStatus } = useTasks();
  const [showForm, setShowForm] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPriority, setFilterPriority] = useState('all');

  // Categorize tasks into columns with smart deadline detection
  const columns = useMemo(() => {
    const filtered = tasks.filter((t) => {
      if (searchQuery && !t.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      if (filterPriority !== 'all' && t.priority !== filterPriority) return false;
      return true;
    });

    const cols: Record<string, Task[]> = {};
    COLUMNS.forEach((c) => { cols[c.id] = []; });

    filtered.forEach((task) => {
      // Smart categorization based on deadline
      if (task.status === 'completed') {
        cols.completed.push(task);
      } else if (task.status === 'overdue' || (isOverdue(task.deadline) && task.status !== 'completed')) {
        cols.overdue.push(task);
      } else if (isInDeadlineZone(task.deadline)) {
        cols.deadline_zone.push(task);
      } else if (task.status === 'in_progress') {
        cols.in_progress.push(task);
      } else {
        cols.todo.push(task);
      }
    });

    return cols;
  }, [tasks, searchQuery, filterPriority]);

  const handleDragEnd = async (result: DropResult) => {
    const { destination, draggableId } = result;
    if (!destination) return;

    const newStatus = destination.droppableId === 'deadline_zone'
      ? 'todo' // Deadline zone is a virtual column
      : destination.droppableId;

    try {
      await changeStatus(parseInt(draggableId), newStatus);
      toast.success('Status actualizat!');
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: string } } };
      toast.error(axiosErr.response?.data?.error || 'Eroare la schimbarea statusului.');
    }
  };

  const handleCreateTask = async (data: TaskFormData) => {
    try {
      await createTask(data);
      toast.success('Task creat cu succes!');
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: string } } };
      toast.error(axiosErr.response?.data?.error || 'Eroare la crearea task-ului.');
      throw err;
    }
  };

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
  };

  return (
    <div className="dashboard-page">
      <Navbar />

      {/* Toolbar */}
      <div className="dashboard-toolbar">
        <div className="toolbar-inner">
          <Button variant="primary" onClick={() => { setSelectedTask(null); setShowForm(true); }} id="new-task-btn">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Task Nou
          </Button>

          <div className="toolbar-search">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              placeholder="Caută task-uri..."
              value={searchQuery}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
              className="toolbar-search-input"
              id="search-tasks"
            />
          </div>

          <select
            className="input-field toolbar-filter"
            value={filterPriority}
            onChange={(e: ChangeEvent<HTMLSelectElement>) => setFilterPriority(e.target.value)}
            id="filter-priority"
          >
            <option value="all">Toate prioritățile</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
        </div>
      </div>

      {/* Kanban Board */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="kanban-board">
          {COLUMNS.map((col) => (
            <div key={col.id} className="kanban-column">
              <div className="kanban-column-header" style={{ '--col-color': col.color } as React.CSSProperties}>
                <div className="kanban-column-title">
                  <span className="kanban-column-icon">{col.icon}</span>
                  <span>{col.title}</span>
                </div>
                <span className="badge-count" style={{ background: `${col.color}20`, color: col.color }}>
                  {columns[col.id]?.length || 0}
                </span>
              </div>

              <Droppable droppableId={col.id}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`kanban-column-body ${snapshot.isDraggingOver ? 'drag-over' : ''}`}
                  >
                    <AnimatePresence>
                      {columns[col.id]?.map((task, index) => (
                        <Draggable key={task.id} draggableId={task.id.toString()} index={index}>
                          {(provided, snapshot) => (
                            <TaskCard
                              task={task}
                              onClick={handleTaskClick}
                              provided={provided}
                              snapshot={snapshot}
                            />
                          )}
                        </Draggable>
                      ))}
                    </AnimatePresence>
                    {provided.placeholder}

                    {columns[col.id]?.length === 0 && (
                      <div className="kanban-empty">
                        <p>Nicio activitate</p>
                      </div>
                    )}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>

      {/* Loading overlay */}
      {loading && <Loader fullScreen />}

      {/* Task Form Modal */}
      <TaskForm
        isOpen={showForm}
        onClose={() => { setShowForm(false); setSelectedTask(null); }}
        onSubmit={handleCreateTask}
        task={selectedTask}
      />

      {/* Task Detail Modal */}
      {selectedTask && !showForm && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedTask(null)}
          title={selectedTask.title}
          className="task-detail"
        >
          <div className="task-detail-body">
            <div className="task-detail-row">
              <span className="label-md">Status</span>
              <span className={`badge badge-${selectedTask.status === 'overdue' ? 'critical' : 'low'}`}>
                {selectedTask.status}
              </span>
            </div>
            <div className="task-detail-row">
              <span className="label-md">Prioritate</span>
              <span className={`badge badge-${selectedTask.priority}`}>
                {selectedTask.priority}
              </span>
            </div>
            <div className="task-detail-row">
              <span className="label-md">Vizibilitate</span>
              <span>{selectedTask.visibility}</span>
            </div>
            <div className="task-detail-row">
              <span className="label-md">Deadline</span>
              <span>{new Date(selectedTask.deadline).toLocaleString('ro-RO')}</span>
            </div>
            {selectedTask.description && (
              <div className="task-detail-desc">
                <span className="label-md">Descriere</span>
                <p>{selectedTask.description}</p>
              </div>
            )}
            {selectedTask.admin_username && (
              <div className="task-detail-row">
                <span className="label-md">Creat de</span>
                <div className="flex items-center gap-2">
                  <div className="avatar avatar-sm">
                    {selectedTask.admin_username.slice(0, 2).toUpperCase()}
                  </div>
                  <span>{selectedTask.admin_username}</span>
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};

export default Dashboard;
