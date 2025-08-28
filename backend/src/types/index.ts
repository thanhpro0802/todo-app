export interface User {
  id: string;
  email: string;
  username: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  timezone: string;
  language: string;
  emailVerified: boolean;
  twoFactorEnabled: boolean;
  subscriptionTier: SubscriptionTier;
  isActive: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Task {
  id: string;
  userId: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: Priority;
  category?: string;
  tags: string[];
  dueDate?: Date;
  estimatedTime?: number;
  actualTime?: number;
  attachments: string[];
  order?: number;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}

export interface Team {
  id: string;
  name: string;
  description?: string;
  ownerId: string;
  inviteCode: string;
  settings: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface TeamMember {
  id: string;
  teamId: string;
  userId: string;
  role: TeamRole;
  joinedAt: Date;
}

export interface TaskShare {
  id: string;
  taskId: string;
  userId: string;
  permission: TaskPermission;
  sharedAt: Date;
  sharedBy: string;
}

export interface TaskActivity {
  id: string;
  taskId: string;
  userId: string;
  action: TaskAction;
  description?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
}

export type SubscriptionTier = 'FREE' | 'PREMIUM' | 'TEAM' | 'ENTERPRISE';
export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
export type TaskPermission = 'VIEW' | 'EDIT';
export type TaskAction = 'CREATED' | 'UPDATED' | 'COMPLETED' | 'DELETED' | 'SHARED' | 'UNSHARED' | 'COMMENTED';
export type TeamRole = 'OWNER' | 'ADMIN' | 'MEMBER' | 'VIEWER';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface SocketEvents {
  // Task events
  'task:created': (task: Task) => void;
  'task:updated': (task: Task) => void;
  'task:deleted': (data: { taskId: string }) => void;
  'task:shared': (data: { task: Task; permission: TaskPermission; sharedBy: User }) => void;
  'task:unshared': (data: { taskId: string }) => void;
  
  // Real-time collaboration
  'user-joined-task': (data: { userId: string; username: string; taskId: string }) => void;
  'user-left-task': (data: { userId: string; taskId: string }) => void;
  'user-typing': (data: { userId: string; username: string; taskId: string }) => void;
  'user-stopped-typing': (data: { userId: string; taskId: string }) => void;
  'task-updated-realtime': (data: { 
    taskId: string; 
    field: string; 
    value: any; 
    updatedBy: { id: string; username: string }; 
    timestamp: Date 
  }) => void;
  
  // Team events
  'team:member-joined': (member: TeamMember) => void;
  'team:member-left': (data: { memberId: string }) => void;
  
  // Presence
  'user-presence-updated': (data: { 
    userId: string; 
    username: string; 
    status: 'online' | 'offline' | 'away' | 'busy'; 
    timestamp: Date 
  }) => void;
}

export interface EmailTemplate {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export interface FileUploadResult {
  url: string;
  publicId: string;
  format: string;
  size: number;
}