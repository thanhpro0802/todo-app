import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../middleware/auth.js';
import { logger } from './logger.js';

const prisma = new PrismaClient();

async function seed() {
  try {
    logger.info('Starting database seed...');

    // Create a demo user
    const hashedPassword = await hashPassword('password123');
    
    const demoUser = await prisma.user.upsert({
      where: { email: 'demo@todoapp.com' },
      update: {},
      create: {
        email: 'demo@todoapp.com',
        username: 'demo_user',
        firstName: 'Demo',
        lastName: 'User',
        password: hashedPassword,
        emailVerified: true,
        subscriptionTier: 'PREMIUM',
        preferences: {
          create: {
            theme: 'light',
            emailNotifications: true,
            pushNotifications: true,
            defaultTaskPriority: 'MEDIUM',
          },
        },
      },
    });

    logger.info(`Created demo user: ${demoUser.email}`);

    // Create some sample tasks
    const sampleTasks = [
      {
        title: 'Complete project documentation',
        description: 'Write comprehensive documentation for the new Todo App backend',
        priority: 'HIGH' as const,
        category: 'Work',
        tags: ['documentation', 'project'],
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
        estimatedTime: 240, // 4 hours
      },
      {
        title: 'Review pull requests',
        description: 'Review and merge pending pull requests from team members',
        priority: 'MEDIUM' as const,
        category: 'Work',
        tags: ['code-review', 'team'],
        dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
        estimatedTime: 120, // 2 hours
      },
      {
        title: 'Grocery shopping',
        description: 'Buy groceries for the week',
        priority: 'LOW' as const,
        category: 'Personal',
        tags: ['shopping', 'groceries'],
        dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // tomorrow
        estimatedTime: 60, // 1 hour
      },
      {
        title: 'Fix production bug',
        description: 'Urgent: Fix the authentication issue reported by users',
        priority: 'URGENT' as const,
        category: 'Work',
        tags: ['bug', 'production', 'urgent'],
        dueDate: new Date(Date.now() + 6 * 60 * 60 * 1000), // 6 hours from now
        estimatedTime: 180, // 3 hours
        completed: true,
        completedAt: new Date(),
      },
    ];

    for (const taskData of sampleTasks) {
      const task = await prisma.task.create({
        data: {
          ...taskData,
          userId: demoUser.id,
          activities: {
            create: {
              userId: demoUser.id,
              action: 'CREATED',
              description: 'Task created during seed',
            },
          },
        },
      });

      // Add some subtasks to the first task
      if (taskData.title === 'Complete project documentation') {
        await prisma.subtask.createMany({
          data: [
            {
              taskId: task.id,
              text: 'Write API documentation',
              order: 1,
            },
            {
              taskId: task.id,
              text: 'Create user guide',
              order: 2,
            },
            {
              taskId: task.id,
              text: 'Add code examples',
              order: 3,
              completed: true,
            },
          ],
        });
      }

      logger.info(`Created sample task: ${task.title}`);
    }

    // Create admin user
    const adminUser = await prisma.user.upsert({
      where: { email: 'admin@todoapp.com' },
      update: {},
      create: {
        email: 'admin@todoapp.com',
        username: 'admin',
        firstName: 'Admin',
        lastName: 'User',
        password: hashedPassword,
        emailVerified: true,
        subscriptionTier: 'ENTERPRISE',
        preferences: {
          create: {
            theme: 'dark',
            emailNotifications: true,
            pushNotifications: true,
            defaultTaskPriority: 'HIGH',
          },
        },
      },
    });

    logger.info(`Created admin user: ${adminUser.email}`);

    logger.info('Database seed completed successfully!');
  } catch (error) {
    logger.error('Error during seed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Only run seed if this file is executed directly
const isMainModule = import.meta.url === `file://${process.argv[1]}`;
if (isMainModule) {
  seed()
    .catch((error) => {
      console.error('Seed failed:', error);
      process.exit(1);
    });
}

export default seed;