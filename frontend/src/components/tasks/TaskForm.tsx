/**
 * @module components/tasks/TaskForm
 * @description Modal form for creating/editing tasks.
 * Matches the Stitch glassmorphism modal design.
 */
import { useState, useEffect, FormEvent, ChangeEvent } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { formatDateForInput } from '../../utils/dateHelpers';
import { Task, TaskFormData, User } from '../../types';
import './TaskForm.css';

interface TaskFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: TaskFormData) => Promise<void>;
  task?: Task | null;
  users?: User[];
}

const TaskForm = ({ isOpen, onClose, onSubmit, task = null, users: _users = [] }: TaskFormProps) => {
  const [formData, setFormData] = useState<TaskFormData>({
    title: '',
    description: '',
    deadline: '',
    visibility: 'personal',
    priority: 'medium',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title,
        description: task.description || '',
        deadline: formatDateForInput(task.deadline),
        visibility: task.visibility,
        priority: task.priority,
      });
    } else {
      // Default deadline: tomorrow at noon
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(12, 0, 0, 0);
      setFormData({
        title: '',
        description: '',
        deadline: formatDateForInput(tomorrow),
        visibility: 'personal',
        priority: 'medium',
      });
    }
  }, [task, isOpen]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onSubmit(formData);
      onClose();
    } catch (_err) {
      // Error handled by parent
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={task ? 'Editează Task' : 'Task Nou'}>
      <form onSubmit={handleSubmit} className="modal-body">
        {/* Title */}
              <div className="input-group">
                <label htmlFor="task-title">Titlu *</label>
                <input
                  id="task-title"
                  name="title"
                  type="text"
                  className="input-field"
                  placeholder="Ex: Implementare autentificare"
                  value={formData.title}
                  onChange={handleChange}
                  maxLength={100}
                  required
                />
              </div>

              {/* Description */}
              <div className="input-group">
                <label htmlFor="task-description">Descriere</label>
                <textarea
                  id="task-description"
                  name="description"
                  className="input-field"
                  placeholder="Descriere detaliată a task-ului (suportă text simplu)"
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                />
              </div>

              {/* Deadline */}
              <div className="input-group">
                <label htmlFor="task-deadline">Deadline *</label>
                <input
                  id="task-deadline"
                  name="deadline"
                  type="datetime-local"
                  className="input-field"
                  value={formData.deadline}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Priority & Visibility row */}
              <div className="form-row">
                <div className="input-group" style={{ flex: 1 }}>
                  <label htmlFor="task-priority">Prioritate</label>
                  <div className="priority-selector">
                    {(['low', 'medium', 'high', 'critical'] as const).map((p) => (
                      <button
                        key={p}
                        type="button"
                        className={`priority-option ${formData.priority === p ? 'active' : ''}`}
                        data-priority={p}
                        onClick={() => setFormData((prev) => ({ ...prev, priority: p }))}
                      >
                        <span className={`priority-dot priority-${p}`} />
                        {p.charAt(0).toUpperCase() + p.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="input-group" style={{ flex: 1 }}>
                  <label>Vizibilitate</label>
                  <div className="visibility-toggle">
                    <button
                      type="button"
                      className={`visibility-option ${formData.visibility === 'personal' ? 'active' : ''}`}
                      onClick={() => setFormData((prev) => ({ ...prev, visibility: 'personal' }))}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                      </svg>
                      Personal
                    </button>
                    <button
                      type="button"
                      className={`visibility-option ${formData.visibility === 'public' ? 'active' : ''}`}
                      onClick={() => setFormData((prev) => ({ ...prev, visibility: 'public' }))}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" />
                        <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
                      </svg>
                      Public
                    </button>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="modal-footer">
                <Button type="button" variant="ghost" onClick={onClose}>
                  Anulează
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  disabled={submitting || !formData.title.trim()}
                  isLoading={submitting}
                  id="submit-task-btn"
                >
                  {submitting ? 'Se salvează...' : task ? 'Salvează' : 'Creează Task'}
                </Button>
              </div>
            </form>
    </Modal>
  );
};

export default TaskForm;
