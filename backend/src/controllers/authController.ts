import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { prisma } from '../config/database.js';
import { config } from '../config/index.js';
import { CustomError, asyncHandler } from '../middleware/errorHandler.js';
import { 
  generateTokens, 
  hashPassword, 
  comparePassword,
  AuthenticatedRequest 
} from '../middleware/auth.js';
import { 
  registerSchema, 
  loginSchema, 
  refreshTokenSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  verifyEmailSchema,
  changePasswordSchema,
  updateProfileSchema
} from '../validators/index.js';
import { sendVerificationEmail, sendPasswordResetEmail } from '../services/emailService.js';
import { logger } from '../utils/logger.js';

export const register = asyncHandler(async (req: Request, res: Response) => {
  const validatedData = registerSchema.parse(req.body);
  
  // Check if user already exists
  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [
        { email: validatedData.email },
        { username: validatedData.username },
      ],
    },
  });

  if (existingUser) {
    throw new CustomError(
      existingUser.email === validatedData.email 
        ? 'User with this email already exists' 
        : 'Username is already taken',
      400
    );
  }

  // Hash password
  const hashedPassword = await hashPassword(validatedData.password);

  // Generate email verification token
  const emailVerifyToken = crypto.randomBytes(32).toString('hex');

  // Create user
  const user = await prisma.user.create({
    data: {
      email: validatedData.email,
      username: validatedData.username,
      firstName: validatedData.firstName,
      lastName: validatedData.lastName,
      password: hashedPassword,
      emailVerifyToken,
      preferences: {
        create: {
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
      },
    },
    select: {
      id: true,
      email: true,
      username: true,
      firstName: true,
      lastName: true,
      subscriptionTier: true,
      emailVerified: true,
      createdAt: true,
    },
  });

  // Send verification email
  await sendVerificationEmail(user.email, emailVerifyToken);

  logger.info(`New user registered: ${user.email}`);

  res.status(201).json({
    message: 'Registration successful. Please check your email to verify your account.',
    user,
  });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const validatedData = loginSchema.parse(req.body);

  // Find user
  const user = await prisma.user.findUnique({
    where: { email: validatedData.email },
    include: { preferences: true },
  });

  if (!user || !user.isActive) {
    throw new CustomError('Invalid email or password', 401);
  }

  // Check password
  const isPasswordValid = await comparePassword(validatedData.password, user.password);
  if (!isPasswordValid) {
    throw new CustomError('Invalid email or password', 401);
  }

  // Generate tokens
  const tokens = generateTokens(user);

  // Save refresh token to database
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

  await prisma.session.create({
    data: {
      userId: user.id,
      refreshToken: tokens.refreshToken,
      userAgent: req.get('User-Agent'),
      ipAddress: req.ip,
      expiresAt,
    },
  });

  // Update last login
  await prisma.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() },
  });

  // Set refresh token as httpOnly cookie if remember me is enabled
  if (validatedData.rememberMe) {
    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: config.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
  }

  logger.info(`User logged in: ${user.email}`);

  res.json({
    message: 'Login successful',
    user: {
      id: user.id,
      email: user.email,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      subscriptionTier: user.subscriptionTier,
      emailVerified: user.emailVerified,
      preferences: user.preferences,
    },
    tokens: {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
    },
  });
});

export const refreshToken = asyncHandler(async (req: Request, res: Response) => {
  const { refreshToken: token } = req.body.refreshToken ? 
    refreshTokenSchema.parse(req.body) : 
    { refreshToken: req.cookies.refreshToken };

  if (!token) {
    throw new CustomError('Refresh token required', 401);
  }

  // Verify refresh token
  const decoded = jwt.verify(token, config.JWT_REFRESH_SECRET) as any;

  // Find session
  const session = await prisma.session.findUnique({
    where: { refreshToken: token },
    include: { user: true },
  });

  if (!session || session.expiresAt < new Date() || !session.user.isActive) {
    throw new CustomError('Invalid or expired refresh token', 401);
  }

  // Generate new tokens
  const newTokens = generateTokens(session.user);

  // Update session with new refresh token
  await prisma.session.update({
    where: { id: session.id },
    data: { refreshToken: newTokens.refreshToken },
  });

  res.json({
    tokens: {
      accessToken: newTokens.accessToken,
      refreshToken: newTokens.refreshToken,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
    },
  });
});

export const logout = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const refreshToken = req.cookies.refreshToken || req.body.refreshToken;

  if (refreshToken) {
    // Delete session from database
    await prisma.session.deleteMany({
      where: { refreshToken },
    });
  }

  // Clear refresh token cookie
  res.clearCookie('refreshToken');

  res.json({ message: 'Logout successful' });
});

export const verifyEmail = asyncHandler(async (req: Request, res: Response) => {
  const { token } = verifyEmailSchema.parse(req.body);

  const user = await prisma.user.findFirst({
    where: { emailVerifyToken: token },
  });

  if (!user) {
    throw new CustomError('Invalid or expired verification token', 400);
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      emailVerified: true,
      emailVerifyToken: null,
    },
  });

  logger.info(`Email verified for user: ${user.email}`);

  res.json({ message: 'Email verified successfully' });
});

export const forgotPassword = asyncHandler(async (req: Request, res: Response) => {
  const { email } = forgotPasswordSchema.parse(req.body);

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    // Don't reveal if user exists or not
    res.json({ message: 'If an account with this email exists, a password reset link has been sent.' });
    return;
  }

  // Generate reset token
  const resetToken = crypto.randomBytes(32).toString('hex');
  const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  await prisma.user.update({
    where: { id: user.id },
    data: {
      emailVerifyToken: resetToken, // Reusing this field for reset token
    },
  });

  // Send reset email
  await sendPasswordResetEmail(user.email, resetToken);

  logger.info(`Password reset requested for user: ${user.email}`);

  res.json({ message: 'If an account with this email exists, a password reset link has been sent.' });
});

export const resetPassword = asyncHandler(async (req: Request, res: Response) => {
  const { token, newPassword } = resetPasswordSchema.parse(req.body);

  const user = await prisma.user.findFirst({
    where: { emailVerifyToken: token },
  });

  if (!user) {
    throw new CustomError('Invalid or expired reset token', 400);
  }

  const hashedPassword = await hashPassword(newPassword);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      password: hashedPassword,
      emailVerifyToken: null,
    },
  });

  // Delete all sessions for this user
  await prisma.session.deleteMany({
    where: { userId: user.id },
  });

  logger.info(`Password reset for user: ${user.email}`);

  res.json({ message: 'Password reset successful. Please log in with your new password.' });
});

export const changePassword = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { currentPassword, newPassword } = changePasswordSchema.parse(req.body);

  const user = await prisma.user.findUnique({
    where: { id: req.user!.id },
  });

  if (!user) {
    throw new CustomError('User not found', 404);
  }

  const isCurrentPasswordValid = await comparePassword(currentPassword, user.password);
  if (!isCurrentPasswordValid) {
    throw new CustomError('Current password is incorrect', 400);
  }

  const hashedPassword = await hashPassword(newPassword);

  await prisma.user.update({
    where: { id: user.id },
    data: { password: hashedPassword },
  });

  // Delete all other sessions for this user
  await prisma.session.deleteMany({
    where: { 
      userId: user.id,
      refreshToken: { not: req.cookies.refreshToken },
    },
  });

  logger.info(`Password changed for user: ${user.email}`);

  res.json({ message: 'Password changed successfully' });
});

export const updateProfile = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const validatedData = updateProfileSchema.parse(req.body);

  // Check if username is already taken (if provided)
  if (validatedData.username) {
    const existingUser = await prisma.user.findFirst({
      where: {
        username: validatedData.username,
        id: { not: req.user!.id },
      },
    });

    if (existingUser) {
      throw new CustomError('Username is already taken', 400);
    }
  }

  const updatedUser = await prisma.user.update({
    where: { id: req.user!.id },
    data: validatedData,
    select: {
      id: true,
      email: true,
      username: true,
      firstName: true,
      lastName: true,
      timezone: true,
      language: true,
      subscriptionTier: true,
      updatedAt: true,
    },
  });

  logger.info(`Profile updated for user: ${updatedUser.email}`);

  res.json({
    message: 'Profile updated successfully',
    user: updatedUser,
  });
});

export const getProfile = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.id },
    select: {
      id: true,
      email: true,
      username: true,
      firstName: true,
      lastName: true,
      avatar: true,
      timezone: true,
      language: true,
      emailVerified: true,
      twoFactorEnabled: true,
      subscriptionTier: true,
      createdAt: true,
      updatedAt: true,
      lastLoginAt: true,
      preferences: true,
    },
  });

  if (!user) {
    throw new CustomError('User not found', 404);
  }

  res.json({ user });
});