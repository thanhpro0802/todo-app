import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/database.js';
import { config } from '../config/index.js';
import { CustomError } from './errorHandler.js';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    username: string;
    subscriptionTier: string;
    firstName?: string;
    lastName?: string;
  };
}

export interface JWTPayload {
  userId: string;
  email: string;
  username: string;
  subscriptionTier: string;
  iat?: number;
  exp?: number;
}

export const authenticateToken = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      throw new CustomError('Access token required', 401);
    }

    const decoded = jwt.verify(token, config.JWT_SECRET) as JWTPayload;
    
    const user = await prisma.user.findUnique({
      where: { 
        id: decoded.userId,
        isActive: true 
      },
      select: {
        id: true,
        email: true,
        username: true,
        subscriptionTier: true,
        emailVerified: true,
      }
    });

    if (!user) {
      throw new CustomError('User not found or inactive', 401);
    }

    if (!user.emailVerified) {
      throw new CustomError('Please verify your email address', 401);
    }

    req.user = {
      id: user.id,
      email: user.email,
      username: user.username,
      subscriptionTier: user.subscriptionTier,
    };

    next();
  } catch (error) {
    next(error);
  }
};

export const optionalAuth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const decoded = jwt.verify(token, config.JWT_SECRET) as JWTPayload;
      const user = await prisma.user.findUnique({
        where: { 
          id: decoded.userId,
          isActive: true 
        },
        select: {
          id: true,
          email: true,
          username: true,
          subscriptionTier: true,
        }
      });

      if (user) {
        req.user = {
          id: user.id,
          email: user.email,
          username: user.username,
          subscriptionTier: user.subscriptionTier,
        };
      }
    }

    next();
  } catch (error) {
    // For optional auth, we don't throw errors, just continue without user
    next();
  }
};

export const requireSubscription = (requiredTier: string) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new CustomError('Authentication required', 401);
    }

    const tierLevels = {
      'FREE': 0,
      'PREMIUM': 1,
      'TEAM': 2,
      'ENTERPRISE': 3,
    };

    const userTierLevel = tierLevels[req.user.subscriptionTier as keyof typeof tierLevels] || 0;
    const requiredTierLevel = tierLevels[requiredTier as keyof typeof tierLevels] || 0;

    if (userTierLevel < requiredTierLevel) {
      throw new CustomError(`${requiredTier} subscription required`, 403);
    }

    next();
  };
};

export const generateTokens = (user: {
  id: string;
  email: string;
  username: string;
  subscriptionTier: string;
}) => {
  const payload: JWTPayload = {
    userId: user.id,
    email: user.email,
    username: user.username,
    subscriptionTier: user.subscriptionTier,
  };

  const accessToken = jwt.sign(payload, config.JWT_SECRET, {
    expiresIn: config.JWT_EXPIRES_IN,
  } as jwt.SignOptions);

  const refreshToken = jwt.sign(payload, config.JWT_REFRESH_SECRET, {
    expiresIn: config.JWT_REFRESH_EXPIRES_IN,
  } as jwt.SignOptions);

  return { accessToken, refreshToken };
};

export const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, config.BCRYPT_ROUNDS);
};

export const comparePassword = async (password: string, hash: string): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};