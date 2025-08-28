import { Response } from 'express';
import { prisma } from '../config/database.js';
import { CustomError, asyncHandler } from '../middleware/errorHandler.js';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { 
  createTaskSchema, 
  updateTaskSchema, 
  getTasksSchema,
  shareTaskSchema 
} from '../validators/index.js';
import { sendTaskSharedNotification } from '../services/emailService.js';
import { logger } from '../utils/logger.js';
import { io } from '../server.js';

export const getTasks = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const validatedQuery = getTasksSchema.parse(req.query);
  
  const page = validatedQuery.page || 1;
  const limit = validatedQuery.limit || 20;
  const skip = (page - 1) * limit;

  const where: any = {
    OR: [
      { userId: req.user!.id },
      { 
        shares: {
          some: { userId: req.user!.id }
        }
      }
    ]
  };

  // Apply filters
  if (validatedQuery.completed !== undefined) {
    where.completed = validatedQuery.completed;
  }

  if (validatedQuery.priority) {
    where.priority = validatedQuery.priority;
  }

  if (validatedQuery.category) {
    where.category = validatedQuery.category;
  }

  if (validatedQuery.search) {
    where.OR = [
      ...where.OR,
      { title: { contains: validatedQuery.search, mode: 'insensitive' } },
      { description: { contains: validatedQuery.search, mode: 'insensitive' } },
    ];
  }

  if (validatedQuery.startDate || validatedQuery.endDate) {
    where.dueDate = {};
    if (validatedQuery.startDate) {
      where.dueDate.gte = new Date(validatedQuery.startDate);
    }
    if (validatedQuery.endDate) {
      where.dueDate.lte = new Date(validatedQuery.endDate);
    }
  }

  // Sorting
  const orderBy: any = {};
  if (validatedQuery.sortBy) {
    orderBy[validatedQuery.sortBy] = validatedQuery.sortOrder || 'desc';
  } else {
    orderBy.createdAt = 'desc';
  }

  const [tasks, total] = await Promise.all([
    prisma.task.findMany({
      where,
      orderBy,
      skip,
      take: limit,
      include: {
        user: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
          },
        },
        shares: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        subtasks: {
          orderBy: { order: 'asc' },
        },
        activities: {
          take: 5,
          orderBy: { createdAt: 'desc' },
          include: {
            user: {
              select: {
                id: true,
                username: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    }),
    prisma.task.count({ where }),
  ]);

  const totalPages = Math.ceil(total / limit);
  const hasNext = page < totalPages;
  const hasPrev = page > 1;

  res.json({
    tasks,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNext,
      hasPrev,
    },
  });
});

export const getTask = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const taskId = req.params.id;

  const task = await prisma.task.findFirst({
    where: {
      id: taskId,
      OR: [
        { userId: req.user!.id },
        { 
          shares: {
            some: { userId: req.user!.id }
          }
        }
      ],
    },
    include: {
      user: {
        select: {
          id: true,
          username: true,
          firstName: true,
          lastName: true,
        },
      },
      shares: {
        include: {
          user: {
            select: {
              id: true,
              username: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      },
      subtasks: {
        orderBy: { order: 'asc' },
      },
      activities: {
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      },
    },
  });

  if (!task) {
    throw new CustomError('Task not found', 404);
  }

  res.json({ task });
});

export const createTask = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const validatedData = createTaskSchema.parse(req.body);

  const task = await prisma.task.create({
    data: {
      ...validatedData,
      userId: req.user!.id,
      dueDate: validatedData.dueDate ? new Date(validatedData.dueDate) : null,
      activities: {
        create: {
          userId: req.user!.id,
          action: 'CREATED',
          description: 'Task created',
        },
      },
    },
    include: {
      user: {
        select: {
          id: true,
          username: true,
          firstName: true,
          lastName: true,
        },
      },
      subtasks: true,
      activities: {
        include: {
          user: {
            select: {
              id: true,
              username: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      },
    },
  });

  // Emit real-time event
  io.to(`user:${req.user!.id}`).emit('task:created', task);

  logger.info(`Task created: ${task.id} by user: ${req.user!.id}`);

  res.status(201).json({
    message: 'Task created successfully',
    task,
  });
});

export const updateTask = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const taskId = req.params.id;
  const validatedData = updateTaskSchema.parse(req.body);

  // Check if user owns the task or has edit permission
  const existingTask = await prisma.task.findFirst({
    where: {
      id: taskId,
      OR: [
        { userId: req.user!.id },
        { 
          shares: {
            some: { 
              userId: req.user!.id,
              permission: 'EDIT'
            }
          }
        }
      ],
    },
    include: {
      shares: {
        include: {
          user: true,
        },
      },
    },
  });

  if (!existingTask) {
    throw new CustomError('Task not found or you do not have permission to edit it', 404);
  }

  // Determine what changed for activity log
  const changes: string[] = [];
  if (validatedData.title && validatedData.title !== existingTask.title) {
    changes.push(`title changed to "${validatedData.title}"`);
  }
  if (validatedData.completed !== undefined && validatedData.completed !== existingTask.completed) {
    changes.push(validatedData.completed ? 'marked as completed' : 'marked as incomplete');
  }
  if (validatedData.priority && validatedData.priority !== existingTask.priority) {
    changes.push(`priority changed to ${validatedData.priority}`);
  }

  const updateData: any = { ...validatedData };
  if (validatedData.dueDate) {
    updateData.dueDate = new Date(validatedData.dueDate);
  }
  if (validatedData.completed && !existingTask.completed) {
    updateData.completedAt = new Date();
  } else if (validatedData.completed === false && existingTask.completed) {
    updateData.completedAt = null;
  }

  const task = await prisma.task.update({
    where: { id: taskId },
    data: {
      ...updateData,
      activities: {
        create: {
          userId: req.user!.id,
          action: 'UPDATED',
          description: changes.length > 0 ? changes.join(', ') : 'Task updated',
        },
      },
    },
    include: {
      user: {
        select: {
          id: true,
          username: true,
          firstName: true,
          lastName: true,
        },
      },
      shares: {
        include: {
          user: {
            select: {
              id: true,
              username: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      },
      subtasks: {
        orderBy: { order: 'asc' },
      },
      activities: {
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      },
    },
  });

  // Emit real-time events to all users with access to this task
  const userIds = [
    task.userId,
    ...task.shares.map((share: any) => share.userId),
  ];

  userIds.forEach(userId => {
    io.to(`user:${userId}`).emit('task:updated', task);
  });

  logger.info(`Task updated: ${task.id} by user: ${req.user!.id}`);

  res.json({
    message: 'Task updated successfully',
    task,
  });
});

export const deleteTask = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const taskId = req.params.id;

  const task = await prisma.task.findFirst({
    where: {
      id: taskId,
      userId: req.user!.id, // Only owner can delete
    },
    include: {
      shares: true,
    },
  });

  if (!task) {
    throw new CustomError('Task not found or you do not have permission to delete it', 404);
  }

  // Get all users with access before deletion
  const userIds = [
    task.userId,
    ...task.shares.map((share: any) => share.userId),
  ];

  await prisma.task.delete({
    where: { id: taskId },
  });

  // Emit real-time events
  userIds.forEach(userId => {
    io.to(`user:${userId}`).emit('task:deleted', { taskId });
  });

  logger.info(`Task deleted: ${taskId} by user: ${req.user!.id}`);

  res.json({ message: 'Task deleted successfully' });
});

export const shareTask = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const taskId = req.params.id;
  const validatedData = shareTaskSchema.parse(req.body);

  // Check if user owns the task
  const task = await prisma.task.findFirst({
    where: {
      id: taskId,
      userId: req.user!.id,
    },
  });

  if (!task) {
    throw new CustomError('Task not found or you do not have permission to share it', 404);
  }

  // Validate that target users exist
  const targetUsers = await prisma.user.findMany({
    where: {
      id: { in: validatedData.userIds },
      isActive: true,
    },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
    },
  });

  if (targetUsers.length !== validatedData.userIds.length) {
    throw new CustomError('One or more users not found', 400);
  }

  // Create shares (use upsert to handle duplicates)
  const shares = await Promise.all(
    targetUsers.map((user: any) =>
      prisma.taskShare.upsert({
        where: {
          taskId_userId: {
            taskId,
            userId: user.id,
          },
        },
        update: {
          permission: validatedData.permission,
        },
        create: {
          taskId,
          userId: user.id,
          permission: validatedData.permission,
          sharedBy: req.user!.id,
        },
      })
    )
  );

  // Create activity log
  await prisma.taskActivity.create({
    data: {
      taskId,
      userId: req.user!.id,
      action: 'SHARED',
      description: `Task shared with ${targetUsers.length} user(s)`,
      metadata: {
        sharedWith: targetUsers.map((u: any) => u.id),
        permission: validatedData.permission,
      },
    },
  });

  // Send email notifications
  await Promise.all(
    targetUsers.map((user: any) =>
      sendTaskSharedNotification(
        user.email,
        `${req.user!.firstName || req.user!.username}`,
        task.title,
        validatedData.permission
      )
    )
  );

  // Emit real-time events
  targetUsers.forEach((user: any) => {
    io.to(`user:${user.id}`).emit('task:shared', {
      task,
      permission: validatedData.permission,
      sharedBy: req.user,
    });
  });

  logger.info(`Task shared: ${taskId} by user: ${req.user!.id} with ${targetUsers.length} users`);

  res.json({
    message: 'Task shared successfully',
    shares,
  });
});

export const unshareTask = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const taskId = req.params.id;
  const userId = req.params.userId;

  // Check if user owns the task
  const task = await prisma.task.findFirst({
    where: {
      id: taskId,
      userId: req.user!.id,
    },
  });

  if (!task) {
    throw new CustomError('Task not found or you do not have permission to unshare it', 404);
  }

  const deletedShare = await prisma.taskShare.delete({
    where: {
      taskId_userId: {
        taskId,
        userId,
      },
    },
  });

  // Create activity log
  await prisma.taskActivity.create({
    data: {
      taskId,
      userId: req.user!.id,
      action: 'UNSHARED',
      description: 'Task access revoked',
      metadata: {
        revokedFrom: userId,
      },
    },
  });

  // Emit real-time event
  io.to(`user:${userId}`).emit('task:unshared', { taskId });

  logger.info(`Task unshared: ${taskId} by user: ${req.user!.id} from user: ${userId}`);

  res.json({ message: 'Task access revoked successfully' });
});

export const getTaskStats = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const where = {
    OR: [
      { userId },
      { 
        shares: {
          some: { userId }
        }
      }
    ]
  };

  const [
    total,
    completed,
    pending,
    overdue,
    dueToday,
    urgent,
  ] = await Promise.all([
    prisma.task.count({ where }),
    prisma.task.count({ where: { ...where, completed: true } }),
    prisma.task.count({ where: { ...where, completed: false } }),
    prisma.task.count({ 
      where: { 
        ...where, 
        completed: false,
        dueDate: { lt: today }
      } 
    }),
    prisma.task.count({ 
      where: { 
        ...where, 
        completed: false,
        dueDate: { gte: today, lt: tomorrow }
      } 
    }),
    prisma.task.count({ 
      where: { 
        ...where, 
        completed: false,
        priority: 'URGENT'
      } 
    }),
  ]);

  res.json({
    stats: {
      total,
      completed,
      pending,
      overdue,
      dueToday,
      urgent,
    },
  });
});