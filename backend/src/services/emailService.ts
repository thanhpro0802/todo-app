import nodemailer from 'nodemailer';
import { config } from '../config/index.js';
import { logger } from '../utils/logger.js';

class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      service: config.EMAIL_SERVICE,
      auth: {
        user: config.EMAIL_USER,
        pass: config.EMAIL_PASSWORD,
      },
    });
  }

  async sendVerificationEmail(email: string, token: string): Promise<void> {
    const verificationUrl = `${config.FRONTEND_URL}/verify-email?token=${token}`;
    
    const mailOptions = {
      from: config.EMAIL_FROM,
      to: email,
      subject: 'Verify Your Email Address - Todo App',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎯 Welcome to Todo App!</h1>
            </div>
            <div class="content">
              <h2>Verify Your Email Address</h2>
              <p>Thank you for joining Todo App! To get started, please verify your email address by clicking the button below:</p>
              
              <div style="text-align: center;">
                <a href="${verificationUrl}" class="button">Verify Email Address</a>
              </div>
              
              <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
              <p style="word-break: break-all; color: #667eea;">${verificationUrl}</p>
              
              <p><strong>This link will expire in 24 hours.</strong></p>
              
              <p>If you didn't create an account with Todo App, you can safely ignore this email.</p>
            </div>
            <div class="footer">
              <p>© 2024 Todo App. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
        Welcome to Todo App!
        
        Please verify your email address by visiting: ${verificationUrl}
        
        This link will expire in 24 hours.
        
        If you didn't create an account with Todo App, you can safely ignore this email.
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      logger.info(`Verification email sent to: ${email}`);
    } catch (error) {
      logger.error('Failed to send verification email:', error);
      throw new Error('Failed to send verification email');
    }
  }

  async sendPasswordResetEmail(email: string, token: string): Promise<void> {
    const resetUrl = `${config.FRONTEND_URL}/reset-password?token=${token}`;
    
    const mailOptions = {
      from: config.EMAIL_FROM,
      to: email,
      subject: 'Password Reset Request - Todo App',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; background: #f5576c; color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
            .warning { background: #fff3cd; border: 1px solid #ffeaa7; color: #856404; padding: 15px; border-radius: 5px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔒 Password Reset Request</h1>
            </div>
            <div class="content">
              <h2>Reset Your Password</h2>
              <p>We received a request to reset your password for your Todo App account. Click the button below to create a new password:</p>
              
              <div style="text-align: center;">
                <a href="${resetUrl}" class="button">Reset Password</a>
              </div>
              
              <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
              <p style="word-break: break-all; color: #f5576c;">${resetUrl}</p>
              
              <div class="warning">
                <strong>Security Notice:</strong>
                <ul>
                  <li>This link will expire in 1 hour</li>
                  <li>You can only use this link once</li>
                  <li>If you didn't request this reset, please ignore this email</li>
                </ul>
              </div>
              
              <p>For your security, we recommend choosing a strong password that includes:</p>
              <ul>
                <li>At least 8 characters</li>
                <li>A mix of uppercase and lowercase letters</li>
                <li>At least one number</li>
                <li>At least one special character</li>
              </ul>
            </div>
            <div class="footer">
              <p>© 2024 Todo App. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
        Password Reset Request - Todo App
        
        We received a request to reset your password. Visit this link to create a new password: ${resetUrl}
        
        This link will expire in 1 hour and can only be used once.
        
        If you didn't request this reset, please ignore this email.
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      logger.info(`Password reset email sent to: ${email}`);
    } catch (error) {
      logger.error('Failed to send password reset email:', error);
      throw new Error('Failed to send password reset email');
    }
  }

  async sendWelcomeEmail(email: string, firstName?: string): Promise<void> {
    const name = firstName || 'there';
    
    const mailOptions = {
      from: config.EMAIL_FROM,
      to: email,
      subject: 'Welcome to Todo App! 🎉',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .feature { background: white; padding: 20px; margin: 15px 0; border-radius: 8px; border-left: 4px solid #667eea; }
            .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Welcome to Todo App, ${name}!</h1>
            </div>
            <div class="content">
              <h2>You're all set to boost your productivity!</h2>
              <p>Congratulations on successfully verifying your email! You now have access to all of Todo App's powerful features:</p>
              
              <div class="feature">
                <h3>📝 Smart Task Management</h3>
                <p>Create, organize, and prioritize your tasks with our intuitive interface.</p>
              </div>
              
              <div class="feature">
                <h3>🏷️ Categories & Tags</h3>
                <p>Keep your tasks organized with custom categories and tags.</p>
              </div>
              
              <div class="feature">
                <h3>⏰ Due Dates & Reminders</h3>
                <p>Never miss a deadline with smart scheduling and notifications.</p>
              </div>
              
              <div class="feature">
                <h3>📊 Progress Tracking</h3>
                <p>Monitor your productivity with detailed analytics and insights.</p>
              </div>
              
              <div style="text-align: center;">
                <a href="${config.FRONTEND_URL}" class="button">Start Using Todo App</a>
              </div>
              
              <p>Need help getting started? Check out our <a href="${config.FRONTEND_URL}/help">Help Center</a> or contact our support team.</p>
              
              <p>Happy organizing!</p>
              <p>The Todo App Team</p>
            </div>
            <div class="footer">
              <p>© 2024 Todo App. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      logger.info(`Welcome email sent to: ${email}`);
    } catch (error) {
      logger.error('Failed to send welcome email:', error);
      // Don't throw error for welcome email as it's not critical
    }
  }

  async sendTaskSharedNotification(
    recipientEmail: string, 
    sharedByName: string, 
    taskTitle: string, 
    permission: string
  ): Promise<void> {
    const mailOptions = {
      from: config.EMAIL_FROM,
      to: recipientEmail,
      subject: `Task Shared: "${taskTitle}" - Todo App`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .task-info { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #4ecdc4; }
            .button { display: inline-block; background: #4ecdc4; color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>📤 Task Shared With You</h1>
            </div>
            <div class="content">
              <p><strong>${sharedByName}</strong> has shared a task with you on Todo App!</p>
              
              <div class="task-info">
                <h3>📝 Task: "${taskTitle}"</h3>
                <p><strong>Permission Level:</strong> ${permission === 'EDIT' ? 'Can Edit' : 'View Only'}</p>
              </div>
              
              <p>You can now ${permission === 'EDIT' ? 'view and edit' : 'view'} this task in your Todo App dashboard.</p>
              
              <div style="text-align: center;">
                <a href="${config.FRONTEND_URL}/tasks" class="button">View Task</a>
              </div>
              
              <p>Stay organized and productive with Todo App!</p>
            </div>
            <div class="footer">
              <p>© 2024 Todo App. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      logger.info(`Task shared notification sent to: ${recipientEmail}`);
    } catch (error) {
      logger.error('Failed to send task shared notification:', error);
    }
  }
}

const emailService = new EmailService();

export const sendVerificationEmail = emailService.sendVerificationEmail.bind(emailService);
export const sendPasswordResetEmail = emailService.sendPasswordResetEmail.bind(emailService);
export const sendWelcomeEmail = emailService.sendWelcomeEmail.bind(emailService);
export const sendTaskSharedNotification = emailService.sendTaskSharedNotification.bind(emailService);

export default emailService;