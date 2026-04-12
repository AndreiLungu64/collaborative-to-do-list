import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { Task, TaskFormData } from '../types';

interface UseTasksReturn {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  fetchTasks: () => Promise<void>;
  createTask: (data: TaskFormData) => Promise<Task>;
  updateTask: (id: number, data: TaskFormData) => Promise<Task>;
  changeStatus: (id: number, status: string) => Promise<Task>;
  deleteTask: (id: number) => Promise<void>;
  grantAccess: (taskId: number, userId: number) => Promise<void>;
  revokeAccess: (taskId: number, userId: number) => Promise<void>;
}

export const useTasks = (): UseTasksReturn => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get('/tasks');
      setTasks(res.data);
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: string } } };
      setError(axiosErr.response?.data?.error || 'Eroare la încărcarea task-urilor.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const createTask = async (data: TaskFormData): Promise<Task> => {
    const res = await api.post('/tasks', data);
    await fetchTasks();
    return res.data.task;
  };

  const updateTask = async (id: number, data: TaskFormData): Promise<Task> => {
    const res = await api.put(`/tasks/${id}`, data);
    await fetchTasks();
    return res.data.task;
  };

  const changeStatus = async (id: number, status: string): Promise<Task> => {
    const res = await api.patch(`/tasks/${id}/status`, { status });
    await fetchTasks();
    return res.data.task;
  };

  const deleteTask = async (id: number): Promise<void> => {
    await api.delete(`/tasks/${id}`);
    await fetchTasks();
  };

  const grantAccess = async (taskId: number, userId: number): Promise<void> => {
    await api.post(`/tasks/${taskId}/access`, { userId });
    await fetchTasks();
  };

  const revokeAccess = async (taskId: number, userId: number): Promise<void> => {
    await api.delete(`/tasks/${taskId}/access/${userId}`);
    await fetchTasks();
  };

  return {
    tasks,
    loading,
    error,
    fetchTasks,
    createTask,
    updateTask,
    changeStatus,
    deleteTask,
    grantAccess,
    revokeAccess,
  };
};
