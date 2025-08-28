# Todo App Backend

A comprehensive backend API for the Todo App with user management, authentication, real-time collaboration, and advanced task management features.

## 🚀 Features

- **Complete Authentication System**
  - JWT with refresh tokens
  - Email verification
  - Password reset functionality
  - 2FA support (ready for implementation)
  - User profile management

- **Advanced Task Management**
  - CRUD operations for tasks
  - Task sharing and collaboration
  - Categories, tags, and priorities
  - Due dates and time tracking
  - Subtasks support
  - Activity logging

- **Real-time Collaboration**
  - Socket.io integration
  - Live task updates
  - User presence indicators
  - Typing indicators

- **Team Features**
  - Team creation and management
  - Role-based permissions (Owner, Admin, Member, Viewer)
  - Team task sharing
  - Invite code system
  - Team member management

- **File Upload & Management**
  - Cloudinary integration for production
  - Local storage for development
  - File type validation
  - File size limits
  - Secure file deletion

- **Subtask Management**
  - Nested subtasks for complex tasks
  - Drag & drop reordering
  - Individual completion tracking
  - Real-time updates

- **Email System**
  - Welcome emails
  - Verification emails
  - Password reset emails
  - Task sharing notifications

- **Security & Performance**
  - Rate limiting
  - Input validation with Zod
  - Comprehensive error handling
  - Logging with Winston
  - CORS configuration

- **Documentation**
  - Swagger/OpenAPI documentation
  - Comprehensive API docs

## 🛠️ Tech Stack

- **Framework**: Node.js with Express.js
- **Database**: SQLite (development) / PostgreSQL (production)
- **ORM**: Prisma
- **Authentication**: JWT with refresh tokens
- **Email**: Nodemailer with professional templates
- **File Storage**: Cloudinary / Local storage
- **Real-time**: Socket.io
- **Validation**: Zod with comprehensive schemas
- **Testing**: Jest with Supertest
- **Documentation**: Swagger/OpenAPI
- **Logging**: Winston with structured logging
- **Security**: Rate limiting, CORS, Helmet

## 📁 Project Structure

```
backend/
├── src/
│   ├── controllers/        # Route controllers
│   │   ├── authController.ts
│   │   ├── taskController.ts
│   │   ├── subtaskController.ts
│   │   └── teamController.ts
│   ├── middleware/         # Auth, validation, error handling
│   │   ├── auth.ts
│   │   └── errorHandler.ts
│   ├── models/            # Database models (Prisma)
│   ├── routes/            # API route definitions
│   │   ├── auth.ts
│   │   ├── tasks.ts
│   │   ├── subtasks.ts
│   │   ├── teams.ts
│   │   ├── files.ts
│   │   └── index.ts
│   ├── services/          # Business logic
│   │   ├── emailService.ts
│   │   └── fileUploadService.ts
│   ├── utils/             # Helper functions
│   │   ├── logger.ts
│   │   ├── socket.ts
│   │   └── seed.ts
│   ├── config/            # Configuration files
│   │   ├── index.ts
│   │   └── database.ts
│   ├── validators/        # Input validation schemas
│   │   └── index.ts
│   ├── types/             # TypeScript type definitions
│   │   └── index.ts
│   └── server.ts          # Main server file
├── prisma/
│   └── schema.prisma      # Database schema
├── tests/                 # Test files
│   ├── setup.ts
│   └── auth.test.ts
├── docs/                  # API documentation
├── docker/                # Docker configuration
│   ├── Dockerfile
│   └── docker-compose.yml
├── package.json
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- SQLite (for development)
- PostgreSQL (for production)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd todo-app/backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env file with your configuration
   ```

4. **Set up the database**
   ```bash
   # Generate Prisma client
   npx prisma generate
   
   # Push database schema
   npx prisma db push
   
   # Seed the database (optional)
   npm run db:seed
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

The server will start on `http://localhost:3001`

### API Documentation

Once the server is running, visit:
- **Swagger UI**: `http://localhost:3001/api-docs`
- **OpenAPI JSON**: `http://localhost:3001/api-docs.json`

## 📚 API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/refresh-token` - Refresh access token
- `POST /api/v1/auth/logout` - User logout
- `POST /api/v1/auth/verify-email` - Verify email address
- `POST /api/v1/auth/forgot-password` - Request password reset
- `POST /api/v1/auth/reset-password` - Reset password
- `POST /api/v1/auth/change-password` - Change password
- `PUT /api/v1/auth/profile` - Update user profile
- `GET /api/v1/auth/profile` - Get user profile

### Tasks
- `GET /api/v1/tasks` - Get user tasks with filtering
- `POST /api/v1/tasks` - Create new task
- `GET /api/v1/tasks/stats` - Get task statistics
- `GET /api/v1/tasks/:id` - Get specific task
- `PUT /api/v1/tasks/:id` - Update task
- `DELETE /api/v1/tasks/:id` - Delete task
- `POST /api/v1/tasks/:id/share` - Share task with users
- `DELETE /api/v1/tasks/:id/share/:userId` - Revoke task access

### Subtasks
- `POST /api/v1/tasks/:taskId/subtasks` - Create subtask
- `PUT /api/v1/tasks/:taskId/subtasks/:id` - Update subtask
- `DELETE /api/v1/tasks/:taskId/subtasks/:id` - Delete subtask
- `POST /api/v1/tasks/:taskId/subtasks/reorder` - Reorder subtasks

### Teams
- `GET /api/v1/teams` - Get user teams
- `POST /api/v1/teams` - Create new team
- `POST /api/v1/teams/join` - Join team by invite code
- `GET /api/v1/teams/:id` - Get specific team
- `PUT /api/v1/teams/:id` - Update team
- `DELETE /api/v1/teams/:id` - Delete team
- `POST /api/v1/teams/:id/members` - Add team member
- `PUT /api/v1/teams/:id/members/:memberId` - Update member role
- `DELETE /api/v1/teams/:id/members/:memberId` - Remove team member
- `POST /api/v1/teams/:id/leave` - Leave team

### Files
- `POST /api/v1/files/upload` - Upload file attachment
- `DELETE /api/v1/files/:publicId` - Delete file

## 🔧 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment | `development` |
| `PORT` | Server port | `3001` |
| `DATABASE_URL` | Database connection string | `file:./dev.db` |
| `JWT_SECRET` | JWT secret key | Required |
| `JWT_REFRESH_SECRET` | JWT refresh secret | Required |
| `JWT_EXPIRES_IN` | Access token expiry | `1h` |
| `JWT_REFRESH_EXPIRES_IN` | Refresh token expiry | `7d` |
| `EMAIL_SERVICE` | Email service provider | `gmail` |
| `EMAIL_USER` | Email username | Optional |
| `EMAIL_PASSWORD` | Email password | Optional |
| `EMAIL_FROM` | From email address | Required |
| `FRONTEND_URL` | Frontend URL for emails | `http://localhost:5173` |
| `REDIS_URL` | Redis connection string | Optional |
| `CLOUDINARY_*` | Cloud storage config | Optional |

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## 🐳 Docker Support

### Development
```bash
docker-compose up --build
```

### Production
```bash
docker build -t todo-app-backend .
docker run -p 3001:3001 todo-app-backend
```

## 🔒 Security Features

- **Rate Limiting**: Configurable request limits per IP
- **CORS**: Properly configured cross-origin requests
- **Helmet**: Security headers
- **Input Validation**: Comprehensive validation with Zod
- **Password Hashing**: bcrypt with configurable rounds
- **JWT Security**: Separate secrets for access and refresh tokens
- **Error Handling**: No sensitive data exposure

## 📊 Monitoring & Logging

- **Winston Logger**: Structured logging with different levels
- **Health Check**: `/health` endpoint for monitoring
- **Request Logging**: Comprehensive request/response logging
- **Error Tracking**: Detailed error logging with stack traces

## 🚀 Deployment

### Environment Setup
1. Set `NODE_ENV=production`
2. Configure PostgreSQL database
3. Set up Redis (optional but recommended)
4. Configure email service
5. Set up cloud storage (optional)
6. Configure proper JWT secrets
7. Set up SSL/TLS

### Database Migration
```bash
# Production database setup
npx prisma migrate deploy
npx prisma generate
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new features
5. Ensure all tests pass
6. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📞 Support

For support, email support@todoapp.com or create an issue in the repository.