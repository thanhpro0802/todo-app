import { Response } from 'express';
import { prisma } from '../config/database.js';
import { CustomError, asyncHandler } from '../middleware/errorHandler.js';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { createSubtaskSchema, updateSubtaskSchema } from '../validators/index.js';
import { logger } from '../utils/logger.js';
import { io } from '../server.js';

export const createSubtask = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const taskId = req.params.taskId;
  const validatedData = createSubtaskSchema.parse(req.body);

  // Check if user has access to the task
  const task = await prisma.task.findFirst({
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

  if (!task) {
    throw new CustomError('Task not found or you do not have permission to edit it', 404);
  }

  // Get the highest order number for subtasks in this task
  const maxOrder = await prisma.subtask.findFirst({
    where: { taskId },
    orderBy: { order: 'desc' },
    select: { order: true },
  });

  const subtask = await prisma.subtask.create({
    data: {
      ...validatedData,
      taskId,
      order: (maxOrder?.order || 0) + 1,
    },
  });

  // Create activity log
  await prisma.taskActivity.create({
    data: {
      taskId,
      userId: req.user!.id,
      action: 'UPDATED',
      description: `Subtask added: "${validatedData.text}"`,
    },
  });

  // Emit real-time events to all users with access to this task
  const userIds = [
    task.userId,
    ...task.shares.map((share: any) => share.userId),
  ];

  userIds.forEach(userId => {
    io.to(`user:${userId}`).emit('subtask:created', {
      taskId,
      subtask,
      createdBy: req.user,
    });
  });

  logger.info(`Subtask created for task: ${taskId} by user: ${req.user!.id}`);

  res.status(201).json({
    message: 'Subtask created successfully',
    subtask,
  });
});

export const updateSubtask = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const taskId = req.params.taskId;
  const subtaskId = req.params.id;
  const validatedData = updateSubtaskSchema.parse(req.body);

  // Check if user has access to the task
  const task = await prisma.task.findFirst({
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

  if (!task) {
    throw new CustomError('Task not found or you do not have permission to edit it', 404);
  }

  // Check if subtask exists and belongs to the task
  const existingSubtask = await prisma.subtask.findFirst({
    where: {
      id: subtaskId,
      taskId,
    },
  });

  if (!existingSubtask) {
    throw new CustomError('Subtask not found', 404);
  }

  const subtask = await prisma.subtask.update({
    where: { id: subtaskId },
    data: validatedData,
  });

  // Create activity log
  const changes: string[] = [];
  if (validatedData.text && validatedData.text !== existingSubtask.text) {
    changes.push(`text changed to "${validatedData.text}"`);
  }
  if (validatedData.completed !== undefined && validatedData.completed !== existingSubtask.completed) {
    changes.push(validatedData.completed ? 'marked as completed' : 'marked as incomplete');
  }

  await prisma.taskActivity.create({
    data: {
      taskId,
      userId: req.user!.id,
      action: 'UPDATED',
      description: `Subtask updated: ${changes.length > 0 ? changes.join(', ') : 'subtask updated'}`,
    },
  });

  // Emit real-time events to all users with access to this task
  const userIds = [
    task.userId,
    ...task.shares.map((share: any) => share.userId),
  ];

  userIds.forEach(userId => {
    io.to(`user:${userId}`).emit('subtask:updated', {
      taskId,
      subtask,
      updatedBy: req.user,
    });
  });

  logger.info(`Subtask updated: ${subtaskId} by user: ${req.user!.id}`);

  res.json({
    message: 'Subtask updated successfully',
    subtask,
  });
});

export const deleteSubtask = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const taskId = req.params.taskId;
  const subtaskId = req.params.id;

  // Check if user has access to the task
  const task = await prisma.task.findFirst({
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

  if (!task) {
    throw new CustomError('Task not found or you do not have permission to edit it', 404);
  }

  // Check if subtask exists and belongs to the task
  const subtask = await prisma.subtask.findFirst({
    where: {
      id: subtaskId,
      taskId,
    },
  });

  if (!subtask) {
    throw new CustomError('Subtask not found', 404);
  }

  await prisma.subtask.delete({
    where: { id: subtaskId },
  });

  // Create activity log
  await prisma.taskActivity.create({
    data: {
      taskId,
      userId: req.user!.id,
      action: 'UPDATED',
      description: `Subtask deleted: "${subtask.text}"`,
    },
  });

  // Emit real-time events to all users with access to this task
  const userIds = [
    task.userId,
    ...task.shares.map((share: any) => share.userId),
  ];

  userIds.forEach(userId => {
    io.to(`user:${userId}`).emit('subtask:deleted', {
      taskId,
      subtaskId,
      deletedBy: req.user,
    });
  });

  logger.info(`Subtask deleted: ${subtaskId} by user: ${req.user!.id}`);

  res.json({ message: 'Subtask deleted successfully' });
});

export const reorderSubtasks = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const taskId = req.params.taskId;
  const { subtaskIds } = req.body;

  if (!Array.isArray(subtaskIds)) {
    throw new CustomError('subtaskIds must be an array', 400);
  }

  // Check if user has access to the task
  const task = await prisma.task.findFirst({
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
      subtasks: true,
      shares: {
        include: {
          user: true,
        },
      },
    },
  });

  if (!task) {
    throw new CustomError('Task not found or you do not have permission to edit it', 404);
  }

  // Verify all subtask IDs belong to this task
  const taskSubtaskIds = task.subtasks.map((st: any) => st.id);
  const invalidIds = subtaskIds.filter((id: string) => !taskSubtaskIds.includes(id));
  
  if (invalidIds.length > 0) {
    throw new CustomError('Some subtask IDs do not belong to this task', 400);
  }

  // Update order for each subtask
  const updatePromises = subtaskIds.map((subtaskId: string, index: number) =>
    prisma.subtask.update({
      where: { id: subtaskId },
      data: { order: index + 1 },
    })
  );

  await Promise.all(updatePromises);

  // Create activity log
  await prisma.taskActivity.create({
    data: {
      taskId,
      userId: req.user!.id,
      action: 'UPDATED',
      description: 'Subtasks reordered',
    },
  });

  // Get updated subtasks
  const updatedSubtasks = await prisma.subtask.findMany({
    where: { taskId },
    orderBy: { order: 'asc' },
  });

  // Emit real-time events to all users with access to this task
  const userIds = [
    task.userId,
    ...task.shares.map((share: any) => share.userId),
  ];

  userIds.forEach(userId => {
    io.to(`user:${userId}`).emit('subtasks:reordered', {
      taskId,
      subtasks: updatedSubtasks,
      reorderedBy: req.user,
    });
  });

  logger.info(`Subtasks reordered for task: ${taskId} by user: ${req.user!.id}`);

  res.json({
    message: 'Subtasks reordered successfully',
    subtasks: updatedSubtasks,
  });
});