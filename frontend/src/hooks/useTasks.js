import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';

export const useTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get('/tasks');
      setTasks(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Eroare la încărcarea task-urilor.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const createTask = async (data) => {
    const res = await api.post('/tasks', data);
    await fetchTasks();
    return res.data.task;
  };

  const updateTask = async (id, data) => {
    const res = await api.put(`/tasks/${id}`, data);
    await fetchTasks();
    return res.data.task;
  };

  const changeStatus = async (id, status) => {
    const res = await api.patch(`/tasks/${id}/status`, { status });
    await fetchTasks();
    return res.data.task;
  };

  const deleteTask = async (id) => {
    await api.delete(`/tasks/${id}`);
    await fetchTasks();
  };

  const grantAccess = async (taskId, userId) => {
    await api.post(`/tasks/${taskId}/access`, { userId });
    await fetchTasks();
  };

  const revokeAccess = async (taskId, userId) => {
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
