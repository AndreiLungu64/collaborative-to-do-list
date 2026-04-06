/**
 * @module types
 * @description Central type definitions for the TaskFlow frontend.
 */

export interface User {
  id: number;
  username: string;
  email: string;
}

export interface AccessUser {
  id: number;
  username: string;
  email: string;
}

export interface Task {
  id: number;
  title: string;
  description?: string;
  status: string;
  visibility: string;
  priority: string;
  deadline: string;
  admin_id: number;
  admin_username?: string;
  created_at?: string;
  updated_at?: string;
  accessList?: AccessUser[];
}

export interface TaskFormData {
  title: string;
  description: string;
  deadline: string;
  visibility: string;
  priority: string;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (username: string, email: string, password: string) => Promise<User>;
  logout: () => void;
}
