import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';
import { prisma } from '../config/database.js';
import { logger } from './logger.js';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  user?: {
    id: string;
    username: string;
    email: string;
    firstName?: string;
    lastName?: string;
  };
}

export const setupSocket = (io: Server) => {
  // Authentication middleware for Socket.io
  io.use(async (socket: any, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];
      
      if (!token) {
        return next(new Error('Authentication token required'));
      }

      const decoded = jwt.verify(token, config.JWT_SECRET) as any;
      
      const user = await prisma.user.findUnique({
        where: { 
          id: decoded.userId,
          isActive: true 
        },
        select: {
          id: true,
          username: true,
          email: true,
          firstName: true,
          lastName: true,
        }
      });

      if (!user) {
        return next(new Error('User not found'));
      }

      socket.userId = user.id;
      socket.user = user;
      next();
    } catch (error) {
      next(new Error('Invalid authentication token'));
    }
  });

  io.on('connection', (socket: AuthenticatedSocket) => {
    logger.info(`User connected: ${socket.user?.username} (${socket.userId})`);
    
    // Join user to their personal room
    socket.join(`user:${socket.userId}`);

    // Handle joining team rooms
    socket.on('join-team', async (teamId: string) => {
      try {
        // Verify user is member of the team
        const membership = await prisma.teamMember.findFirst({
          where: {
            teamId,
            userId: socket.userId,
          },
        });

        if (membership) {
          socket.join(`team:${teamId}`);
          logger.info(`User ${socket.userId} joined team room: ${teamId}`);
        }
      } catch (error) {
        logger.error('Error joining team room:', error);
      }
    });

    // Handle leaving team rooms
    socket.on('leave-team', (teamId: string) => {
      socket.leave(`team:${teamId}`);
      logger.info(`User ${socket.userId} left team room: ${teamId}`);
    });

    // Handle typing indicators for shared tasks
    socket.on('typing-start', (data: { taskId: string }) => {
      socket.to(`task:${data.taskId}`).emit('user-typing', {
        userId: socket.userId,
        username: socket.user?.username,
        taskId: data.taskId,
      });
    });

    socket.on('typing-stop', (data: { taskId: string }) => {
      socket.to(`task:${data.taskId}`).emit('user-stopped-typing', {
        userId: socket.userId,
        taskId: data.taskId,
      });
    });

    // Handle task collaboration
    socket.on('join-task', async (taskId: string) => {
      try {
        // Verify user has access to the task
        const task = await prisma.task.findFirst({
          where: {
            id: taskId,
            OR: [
              { userId: socket.userId },
              { 
                shares: {
                  some: { userId: socket.userId }
                }
              }
            ],
          },
        });

        if (task) {
          socket.join(`task:${taskId}`);
          
          // Notify others that user joined task view
          socket.to(`task:${taskId}`).emit('user-joined-task', {
            userId: socket.userId,
            username: socket.user?.username,
            taskId,
          });
        }
      } catch (error) {
        logger.error('Error joining task room:', error);
      }
    });

    socket.on('leave-task', (taskId: string) => {
      socket.leave(`task:${taskId}`);
      socket.to(`task:${taskId}`).emit('user-left-task', {
        userId: socket.userId,
        taskId,
      });
    });

    // Handle real-time task updates
    socket.on('task-update', async (data: { taskId: string; field: string; value: any }) => {
      try {
        // Verify user has edit permission
        const task = await prisma.task.findFirst({
          where: {
            id: data.taskId,
            OR: [
              { userId: socket.userId },
              { 
                shares: {
                  some: { 
                    userId: socket.userId,
                    permission: 'EDIT'
                  }
                }
              }
            ],
          },
        });

        if (task) {
          // Broadcast the update to all users viewing the task
          socket.to(`task:${data.taskId}`).emit('task-updated-realtime', {
            taskId: data.taskId,
            field: data.field,
            value: data.value,
            updatedBy: {
              id: socket.userId,
              username: socket.user?.username,
            },
            timestamp: new Date(),
          });
        }
      } catch (error) {
        logger.error('Error handling task update:', error);
      }
    });

    // Handle comments on tasks (if implemented)
    socket.on('add-comment', async (data: { taskId: string; comment: string }) => {
      try {
        // Verify user has access to the task
        const task = await prisma.task.findFirst({
          where: {
            id: data.taskId,
            OR: [
              { userId: socket.userId },
              { 
                shares: {
                  some: { userId: socket.userId }
                }
              }
            ],
          },
        });

        if (task) {
          // Broadcast the comment to all users viewing the task
          socket.to(`task:${data.taskId}`).emit('comment-added', {
            taskId: data.taskId,
            comment: data.comment,
            author: {
              id: socket.userId,
              username: socket.user?.username,
              firstName: socket.user?.firstName,
              lastName: socket.user?.lastName,
            },
            timestamp: new Date(),
          });
        }
      } catch (error) {
        logger.error('Error handling comment:', error);
      }
    });

    // Handle presence updates
    socket.on('update-presence', (status: 'online' | 'away' | 'busy') => {
      // Broadcast presence to all team members
      socket.broadcast.emit('user-presence-updated', {
        userId: socket.userId,
        username: socket.user?.username,
        status,
        timestamp: new Date(),
      });
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      logger.info(`User disconnected: ${socket.user?.username} (${socket.userId})`);
      
      // Broadcast offline status to all team members
      socket.broadcast.emit('user-presence-updated', {
        userId: socket.userId,
        username: socket.user?.username,
        status: 'offline',
        timestamp: new Date(),
      });
    });

    // Error handling
    socket.on('error', (error) => {
      logger.error('Socket error:', error);
    });
  });

  // Handle connection errors
  io.on('connect_error', (error) => {
    logger.error('Socket connection error:', error);
  });
};