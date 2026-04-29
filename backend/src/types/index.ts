/**
 * @module types
 * @description Central type definitions for the TaskFlow backend.
 */
import { Request } from 'express';

// ─── Database Models ─────────────────────────────────────────

export interface User {
  id: number;
  username: string;
  email: string;
  password?: string;
  created_at?: Date;
}

export interface Task {
  id: number;
  title: string;
  description?: string;
  status: string;
  visibility: string;
  priority: string;
  deadline: Date;
  admin_id: number;
  admin_username?: string;
  created_at?: Date;
  updated_at?: Date;
  accessList?: AccessUser[];
}

export interface AccessUser {
  id: number;
  username: string;
  email: string;
}

export interface TaskAccess {
  id: number;
  task_id: number;
  user_id: number;
}

// ─── Input DTOs ──────────────────────────────────────────────

export interface TaskInput {
  title: string;
  description?: string;
  deadline: string;
  visibility?: string;
  priority?: string;
}

export interface RegisterInput {
  username: string;
  email: string;
  password: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

// ─── Auth ────────────────────────────────────────────────────

export interface JwtPayload {
  id: number;
  username: string;
  email: string;
}

export interface AuthRequest extends Request {
  user: JwtPayload;
}

// ─── Errors ──────────────────────────────────────────────────

export interface AppError extends Error {
  statusCode?: number;
}

// ─── Service Results ─────────────────────────────────────────

export interface AuthResult {
  user: Omit<User, 'password'>;
  token: string;
}
