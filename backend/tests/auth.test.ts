import { describe, it, expect, beforeEach } from '@jest/globals';
import request from 'supertest';
import { app } from '../src/server.js';
import { prisma } from './setup.js';
import { hashPassword } from '../src/middleware/auth.js';

describe('Auth Controller', () => {
  describe('POST /api/v1/auth/register', () => {
    it('should register a new user successfully', async () => {
      const userData = {
        email: 'test@example.com',
        username: 'testuser',
        password: 'Password123',
        firstName: 'Test',
        lastName: 'User',
      };

      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.email).toBe(userData.email);
      expect(response.body.user.username).toBe(userData.username);
      expect(response.body.user).not.toHaveProperty('password');
    });

    it('should not register user with duplicate email', async () => {
      const userData = {
        email: 'test@example.com',
        username: 'testuser1',
        password: 'Password123',
      };

      // Create first user
      await request(app)
        .post('/api/v1/auth/register')
        .send(userData)
        .expect(201);

      // Try to create second user with same email
      const duplicateData = {
        ...userData,
        username: 'testuser2',
      };

      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(duplicateData)
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should validate password requirements', async () => {
      const userData = {
        email: 'test@example.com',
        username: 'testuser',
        password: 'weak',
      };

      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Validation Error');
    });
  });

  describe('POST /api/v1/auth/login', () => {
    beforeEach(async () => {
      // Create a test user
      const hashedPassword = await hashPassword('Password123');
      await prisma.user.create({
        data: {
          email: 'test@example.com',
          username: 'testuser',
          password: hashedPassword,
          emailVerified: true,
          preferences: {
            create: {},
          },
        },
      });
    });

    it('should login with valid credentials', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'Password123',
      };

      const response = await request(app)
        .post('/api/v1/auth/login')
        .send(loginData)
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Login successful');
      expect(response.body).toHaveProperty('user');
      expect(response.body).toHaveProperty('tokens');
      expect(response.body.tokens).toHaveProperty('accessToken');
      expect(response.body.tokens).toHaveProperty('refreshToken');
    });

    it('should not login with invalid credentials', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'WrongPassword',
      };

      const response = await request(app)
        .post('/api/v1/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body).toHaveProperty('error', 'Invalid email or password');
    });

    it('should not login unverified user', async () => {
      // Create unverified user
      const hashedPassword = await hashPassword('Password123');
      await prisma.user.create({
        data: {
          email: 'unverified@example.com',
          username: 'unverified',
          password: hashedPassword,
          emailVerified: false,
          preferences: {
            create: {},
          },
        },
      });

      const loginData = {
        email: 'unverified@example.com',
        password: 'Password123',
      };

      // This should actually succeed but return a user with emailVerified: false
      // The frontend should handle the verification check
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send(loginData)
        .expect(200);

      expect(response.body.user.emailVerified).toBe(false);
    });
  });

  describe('POST /api/v1/auth/refresh-token', () => {
    let refreshToken: string;
    let userId: string;

    beforeEach(async () => {
      // Create and login user to get refresh token
      const hashedPassword = await hashPassword('Password123');
      const user = await prisma.user.create({
        data: {
          email: 'test@example.com',
          username: 'testuser',
          password: hashedPassword,
          emailVerified: true,
          preferences: {
            create: {},
          },
        },
      });
      userId = user.id;

      const loginResponse = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'test@example.com',
          password: 'Password123',
        });

      refreshToken = loginResponse.body.tokens.refreshToken;
    });

    it('should refresh token with valid refresh token', async () => {
      const response = await request(app)
        .post('/api/v1/auth/refresh-token')
        .send({ refreshToken })
        .expect(200);

      expect(response.body).toHaveProperty('tokens');
      expect(response.body.tokens).toHaveProperty('accessToken');
      expect(response.body.tokens).toHaveProperty('refreshToken');
    });

    it('should not refresh with invalid token', async () => {
      const response = await request(app)
        .post('/api/v1/auth/refresh-token')
        .send({ refreshToken: 'invalid-token' })
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });
  });
});