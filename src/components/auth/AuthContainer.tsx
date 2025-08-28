import React, { useState } from 'react';
import { LoginForm } from './LoginForm';
import { RegisterForm } from './RegisterForm';
import { ForgotPasswordForm } from './ForgotPasswordForm';

type AuthMode = 'login' | 'register' | 'forgot-password';

export const AuthContainer: React.FC = () => {
  const [mode, setMode] = useState<AuthMode>('login');

  const switchToLogin = () => setMode('login');
  const switchToRegister = () => setMode('register');
  const switchToForgotPassword = () => setMode('forgot-password');

  switch (mode) {
    case 'login':
      return (
        <LoginForm
          onSwitchToRegister={switchToRegister}
          onForgotPassword={switchToForgotPassword}
        />
      );
    case 'register':
      return <RegisterForm onSwitchToLogin={switchToLogin} />;
    case 'forgot-password':
      return <ForgotPasswordForm onSwitchToLogin={switchToLogin} />;
    default:
      return (
        <LoginForm
          onSwitchToRegister={switchToRegister}
          onForgotPassword={switchToForgotPassword}
        />
      );
  }
};