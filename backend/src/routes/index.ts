import { Express } from 'express';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { config } from '../config/index.js';

// Import route modules
import authRoutes from './auth.js';
import taskRoutes from './tasks.js';
import subtaskRoutes from './subtasks.js';
import fileRoutes from './files.js';
import teamRoutes from './teams.js';

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Todo App API',
      version: '1.0.0',
      description: 'Comprehensive Todo App API with user management, authentication, and collaboration features',
      contact: {
        name: 'Todo App Team',
        email: 'support@todoapp.com',
      },
    },
    servers: [
      {
        url: `http://localhost:${config.PORT}${config.API_PREFIX}/${config.API_VERSION}`,
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./src/routes/*.ts', './src/controllers/*.ts'], // Path to the API files
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

export const setupRoutes = (app: Express) => {
  const apiPrefix = `${config.API_PREFIX}/${config.API_VERSION}`;
  
  // API Documentation
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    explorer: true,
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'Todo App API Documentation',
  }));

  // Serve OpenAPI spec as JSON
  app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });

  // API Routes
  app.use(`${apiPrefix}/auth`, authRoutes);
  app.use(`${apiPrefix}/tasks`, taskRoutes);
  app.use(`${apiPrefix}/tasks`, subtaskRoutes);
  app.use(`${apiPrefix}/files`, fileRoutes);
  app.use(`${apiPrefix}/teams`, teamRoutes);

  // API Info endpoint
  app.get(`${apiPrefix}`, (req, res) => {
    res.json({
      name: 'Todo App API',
      version: '1.0.0',
      description: 'Comprehensive Todo App API with user management, authentication, and collaboration features',
      documentation: '/api-docs',
      endpoints: {
        auth: `${apiPrefix}/auth`,
        tasks: `${apiPrefix}/tasks`,
        subtasks: `${apiPrefix}/tasks/:taskId/subtasks`,
        files: `${apiPrefix}/files`,
        teams: `${apiPrefix}/teams`,
      },
    });
  });
};