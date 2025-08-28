import { Response } from 'express';
import crypto from 'crypto';
import { prisma } from '../config/database.js';
import { CustomError, asyncHandler } from '../middleware/errorHandler.js';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { 
  createTeamSchema, 
  updateTeamSchema,
  addTeamMemberSchema,
  updateTeamMemberSchema
} from '../validators/index.js';
import { logger } from '../utils/logger.js';
import { io } from '../server.js';

export const createTeam = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const validatedData = createTeamSchema.parse(req.body);

  // Generate unique invite code
  const inviteCode = crypto.randomBytes(16).toString('hex');

  const team = await prisma.team.create({
    data: {
      ...validatedData,
      ownerId: req.user!.id,
      inviteCode,
      members: {
        create: {
          userId: req.user!.id,
          role: 'OWNER',
        },
      },
    },
    include: {
      owner: {
        select: {
          id: true,
          username: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
      members: {
        include: {
          user: {
            select: {
              id: true,
              username: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      },
    },
  });

  logger.info(`Team created: ${team.id} by user: ${req.user!.id}`);

  res.status(201).json({
    message: 'Team created successfully',
    team,
  });
});

export const getTeams = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const teams = await prisma.team.findMany({
    where: {
      members: {
        some: {
          userId: req.user!.id,
        },
      },
    },
    include: {
      owner: {
        select: {
          id: true,
          username: true,
          firstName: true,
          lastName: true,
        },
      },
      members: {
        include: {
          user: {
            select: {
              id: true,
              username: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      },
      _count: {
        select: {
          members: true,
          projects: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  res.json({ teams });
});

export const getTeam = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const teamId = req.params.id;

  const team = await prisma.team.findFirst({
    where: {
      id: teamId,
      members: {
        some: {
          userId: req.user!.id,
        },
      },
    },
    include: {
      owner: {
        select: {
          id: true,
          username: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
      members: {
        include: {
          user: {
            select: {
              id: true,
              username: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
        orderBy: { joinedAt: 'asc' },
      },
      projects: {
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!team) {
    throw new CustomError('Team not found', 404);
  }

  res.json({ team });
});

export const updateTeam = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const teamId = req.params.id;
  const validatedData = updateTeamSchema.parse(req.body);

  // Check if user is owner or admin
  const membership = await prisma.teamMember.findFirst({
    where: {
      teamId,
      userId: req.user!.id,
      role: { in: ['OWNER', 'ADMIN'] },
    },
  });

  if (!membership) {
    throw new CustomError('You do not have permission to update this team', 403);
  }

  const team = await prisma.team.update({
    where: { id: teamId },
    data: validatedData,
    include: {
      owner: {
        select: {
          id: true,
          username: true,
          firstName: true,
          lastName: true,
        },
      },
      members: {
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

  // Emit real-time event to all team members
  const memberIds = team.members.map((member: any) => member.userId);
  memberIds.forEach((userId: string) => {
    io.to(`user:${userId}`).emit('team:updated', {
      team,
      updatedBy: req.user,
    });
  });

  logger.info(`Team updated: ${teamId} by user: ${req.user!.id}`);

  res.json({
    message: 'Team updated successfully',
    team,
  });
});

export const deleteTeam = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const teamId = req.params.id;

  // Check if user is the owner
  const team = await prisma.team.findFirst({
    where: {
      id: teamId,
      ownerId: req.user!.id,
    },
    include: {
      members: true,
    },
  });

  if (!team) {
    throw new CustomError('Team not found or you do not have permission to delete it', 404);
  }

  const memberIds = team.members.map((member: any) => member.userId);

  await prisma.team.delete({
    where: { id: teamId },
  });

  // Emit real-time event to all team members
  memberIds.forEach((userId: string) => {
    io.to(`user:${userId}`).emit('team:deleted', {
      teamId,
      deletedBy: req.user,
    });
  });

  logger.info(`Team deleted: ${teamId} by user: ${req.user!.id}`);

  res.json({ message: 'Team deleted successfully' });
});

export const joinTeamByInvite = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { inviteCode } = req.body;

  if (!inviteCode) {
    throw new CustomError('Invite code is required', 400);
  }

  const team = await prisma.team.findUnique({
    where: { inviteCode },
    include: {
      members: {
        where: { userId: req.user!.id },
      },
    },
  });

  if (!team) {
    throw new CustomError('Invalid invite code', 400);
  }

  if (team.members.length > 0) {
    throw new CustomError('You are already a member of this team', 400);
  }

  const membership = await prisma.teamMember.create({
    data: {
      teamId: team.id,
      userId: req.user!.id,
      role: 'MEMBER',
    },
    include: {
      user: {
        select: {
          id: true,
          username: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
      team: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  // Get all team members to notify them
  const allMembers = await prisma.teamMember.findMany({
    where: { teamId: team.id },
    select: { userId: true },
  });

  // Emit real-time event to all team members
  allMembers.forEach((member: any) => {
    io.to(`user:${member.userId}`).emit('team:member-joined', {
      membership,
      teamId: team.id,
    });
  });

  logger.info(`User joined team: ${team.id} via invite by user: ${req.user!.id}`);

  res.json({
    message: 'Successfully joined team',
    membership,
  });
});

export const addTeamMember = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const teamId = req.params.id;
  const validatedData = addTeamMemberSchema.parse(req.body);

  // Check if user is owner or admin
  const membership = await prisma.teamMember.findFirst({
    where: {
      teamId,
      userId: req.user!.id,
      role: { in: ['OWNER', 'ADMIN'] },
    },
  });

  if (!membership) {
    throw new CustomError('You do not have permission to add members to this team', 403);
  }

  // Check if target user exists
  const targetUser = await prisma.user.findUnique({
    where: { id: validatedData.userId },
    select: {
      id: true,
      username: true,
      firstName: true,
      lastName: true,
      email: true,
    },
  });

  if (!targetUser) {
    throw new CustomError('User not found', 404);
  }

  // Check if user is already a member
  const existingMembership = await prisma.teamMember.findFirst({
    where: {
      teamId,
      userId: validatedData.userId,
    },
  });

  if (existingMembership) {
    throw new CustomError('User is already a member of this team', 400);
  }

  const newMembership = await prisma.teamMember.create({
    data: {
      teamId,
      userId: validatedData.userId,
      role: validatedData.role || 'MEMBER',
    },
    include: {
      user: {
        select: {
          id: true,
          username: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
    },
  });

  // Get all team members to notify them
  const allMembers = await prisma.teamMember.findMany({
    where: { teamId },
    select: { userId: true },
  });

  // Emit real-time event to all team members
  allMembers.forEach((member: any) => {
    io.to(`user:${member.userId}`).emit('team:member-added', {
      membership: newMembership,
      addedBy: req.user,
      teamId,
    });
  });

  logger.info(`User added to team: ${teamId} by user: ${req.user!.id}`);

  res.status(201).json({
    message: 'Team member added successfully',
    membership: newMembership,
  });
});

export const updateTeamMember = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const teamId = req.params.id;
  const memberId = req.params.memberId;
  const validatedData = updateTeamMemberSchema.parse(req.body);

  // Check if user is owner or admin
  const userMembership = await prisma.teamMember.findFirst({
    where: {
      teamId,
      userId: req.user!.id,
      role: { in: ['OWNER', 'ADMIN'] },
    },
  });

  if (!userMembership) {
    throw new CustomError('You do not have permission to update team members', 403);
  }

  // Find the target member
  const targetMembership = await prisma.teamMember.findFirst({
    where: {
      id: memberId,
      teamId,
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
    },
  });

  if (!targetMembership) {
    throw new CustomError('Team member not found', 404);
  }

  // Prevent owner from changing their own role
  if (targetMembership.userId === req.user!.id && targetMembership.role === 'OWNER') {
    throw new CustomError('Team owners cannot change their own role', 400);
  }

  // Only owners can assign/remove owner role
  if (validatedData.role === 'OWNER' && userMembership.role !== 'OWNER') {
    throw new CustomError('Only team owners can assign owner role', 403);
  }

  const updatedMembership = await prisma.teamMember.update({
    where: { id: memberId },
    data: { role: validatedData.role },
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
  });

  // Get all team members to notify them
  const allMembers = await prisma.teamMember.findMany({
    where: { teamId },
    select: { userId: true },
  });

  // Emit real-time event to all team members
  allMembers.forEach((member: any) => {
    io.to(`user:${member.userId}`).emit('team:member-updated', {
      membership: updatedMembership,
      updatedBy: req.user,
      teamId,
    });
  });

  logger.info(`Team member updated: ${memberId} in team: ${teamId} by user: ${req.user!.id}`);

  res.json({
    message: 'Team member updated successfully',
    membership: updatedMembership,
  });
});

export const removeTeamMember = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const teamId = req.params.id;
  const memberId = req.params.memberId;

  // Check if user is owner or admin, or removing themselves
  const userMembership = await prisma.teamMember.findFirst({
    where: {
      teamId,
      userId: req.user!.id,
    },
  });

  const targetMembership = await prisma.teamMember.findFirst({
    where: {
      id: memberId,
      teamId,
    },
  });

  if (!userMembership || !targetMembership) {
    throw new CustomError('Team member not found', 404);
  }

  // Users can remove themselves, or owners/admins can remove others
  const canRemove = 
    targetMembership.userId === req.user!.id || // Self-removal
    ['OWNER', 'ADMIN'].includes(userMembership.role); // Admin removal

  if (!canRemove) {
    throw new CustomError('You do not have permission to remove this team member', 403);
  }

  // Prevent owner from removing themselves if they're the only owner
  if (targetMembership.role === 'OWNER' && targetMembership.userId === req.user!.id) {
    const ownerCount = await prisma.teamMember.count({
      where: {
        teamId,
        role: 'OWNER',
      },
    });

    if (ownerCount === 1) {
      throw new CustomError('Cannot remove the last owner. Transfer ownership first.', 400);
    }
  }

  await prisma.teamMember.delete({
    where: { id: memberId },
  });

  // Get all remaining team members to notify them
  const allMembers = await prisma.teamMember.findMany({
    where: { teamId },
    select: { userId: true },
  });

  // Emit real-time event to all team members
  allMembers.forEach((member: any) => {
    io.to(`user:${member.userId}`).emit('team:member-removed', {
      memberId,
      removedUserId: targetMembership.userId,
      removedBy: req.user,
      teamId,
    });
  });

  // Also notify the removed user
  io.to(`user:${targetMembership.userId}`).emit('team:member-removed', {
    memberId,
    removedUserId: targetMembership.userId,
    removedBy: req.user,
    teamId,
  });

  logger.info(`Team member removed: ${memberId} from team: ${teamId} by user: ${req.user!.id}`);

  res.json({ message: 'Team member removed successfully' });
});

export const leaveTeam = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const teamId = req.params.id;

  const membership = await prisma.teamMember.findFirst({
    where: {
      teamId,
      userId: req.user!.id,
    },
  });

  if (!membership) {
    throw new CustomError('You are not a member of this team', 404);
  }

  // Check if user is the last owner
  if (membership.role === 'OWNER') {
    const ownerCount = await prisma.teamMember.count({
      where: {
        teamId,
        role: 'OWNER',
      },
    });

    if (ownerCount === 1) {
      throw new CustomError('Cannot leave team as the last owner. Transfer ownership first.', 400);
    }
  }

  await prisma.teamMember.delete({
    where: { id: membership.id },
  });

  // Get all remaining team members to notify them
  const allMembers = await prisma.teamMember.findMany({
    where: { teamId },
    select: { userId: true },
  });

  // Emit real-time event to all team members
  allMembers.forEach((member: any) => {
    io.to(`user:${member.userId}`).emit('team:member-left', {
      memberId: membership.id,
      leftUserId: req.user!.id,
      teamId,
    });
  });

  logger.info(`User left team: ${teamId}, user: ${req.user!.id}`);

  res.json({ message: 'Left team successfully' });
});