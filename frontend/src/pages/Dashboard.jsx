/**
 * @module pages/Dashboard
 * @description Main dashboard with Kanban Board.
 * 5 columns: To Do, In Progress, Deadline Zone, Completed, Overdue.
 * Supports drag-and-drop via @hello-pangea/dnd.
 */
import { useState, useMemo } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '../components/common/Navbar';
import TaskCard from '../components/kanban/TaskCard';
import TaskForm from '../components/tasks/TaskForm';
import { useTasks } from '../hooks/useTasks';
import { isInDeadlineZone, isOverdue } from '../utils/dateHelpers';
import toast from 'react-hot-toast';
import './Dashboard.css';

const COLUMNS = [
  { id: 'todo', title: 'To Do', icon: '📋', color: 'var(--status-todo)' },
  { id: 'in_progress', title: 'In Progress', icon: '🔄', color: 'var(--status-in-progress)' },
  { id: 'deadline_zone', title: 'Deadline Zone', icon: '⚠️', color: 'var(--status-deadline-zone)' },
  { id: 'completed', title: 'Completed', icon: '✅', color: 'var(--status-completed)' },
  { id: 'overdue', title: 'Overdue', icon: '🔴', color: 'var(--status-overdue)' },
];

const Dashboard = () => {
  const { tasks, loading, createTask, changeStatus, deleteTask } = useTasks();
  const [showForm, setShowForm] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPriority, setFilterPriority] = useState('all');

  // Categorize tasks into columns with smart deadline detection
  const columns = useMemo(() => {
    const filtered = tasks.filter((t) => {
      if (searchQuery && !t.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      if (filterPriority !== 'all' && t.priority !== filterPriority) return false;
      return true;
    });

    const cols = {};
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

  const handleDragEnd = async (result) => {
    const { destination, draggableId } = result;
    if (!destination) return;

    const newStatus = destination.droppableId === 'deadline_zone'
      ? 'todo' // Deadline zone is a virtual column
      : destination.droppableId;

    try {
      await changeStatus(parseInt(draggableId), newStatus);
      toast.success('Status actualizat!');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Eroare la schimbarea statusului.');
    }
  };

  const handleCreateTask = async (data) => {
    try {
      await createTask(data);
      toast.success('Task creat cu succes!');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Eroare la crearea task-ului.');
      throw err;
    }
  };

  const handleTaskClick = (task) => {
    setSelectedTask(task);
  };

  return (
    <div className="dashboard-page">
      <Navbar />

      {/* Toolbar */}
      <div className="dashboard-toolbar">
        <div className="toolbar-inner">
          <button className="btn btn-primary" onClick={() => { setSelectedTask(null); setShowForm(true); }} id="new-task-btn">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Task Nou
          </button>

          <div className="toolbar-search">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              placeholder="Caută task-uri..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="toolbar-search-input"
              id="search-tasks"
            />
          </div>

          <select
            className="input-field toolbar-filter"
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
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
              <div className="kanban-column-header" style={{ '--col-color': col.color }}>
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
      {loading && (
        <div className="dashboard-loading">
          <div className="loader" />
        </div>
      )}

      {/* Task Form Modal */}
      <TaskForm
        isOpen={showForm}
        onClose={() => { setShowForm(false); setSelectedTask(null); }}
        onSubmit={handleCreateTask}
        task={selectedTask}
      />

      {/* Task Detail Modal */}
      <AnimatePresence>
        {selectedTask && !showForm && (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedTask(null)}
          >
            <motion.div
              className="modal glass-card-elevated task-detail"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header">
                <h2 className="headline-sm">{selectedTask.title}</h2>
                <button className="btn btn-ghost btn-sm" onClick={() => setSelectedTask(null)}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
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
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Dashboard;
