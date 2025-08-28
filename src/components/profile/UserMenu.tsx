import React, { useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { UserIcon, CogIcon } from '@heroicons/react/24/outline';

interface UserMenuProps {
  onLogout: () => void;
  onShowProfile: () => void;
}

export const UserMenu: React.FC<UserMenuProps> = ({ onLogout, onShowProfile }) => {
  const { user } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);

  if (!user) return null;

  const getInitials = () => {
    return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
  };

  const getDisplayName = () => {
    return `${user.firstName} ${user.lastName}`;
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white border border-gray-200 hover:bg-gray-50 transition-colors"
      >
        {user.avatar ? (
          <img
            src={user.avatar}
            alt={getDisplayName()}
            className="w-8 h-8 rounded-full object-cover"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-medium">
            {getInitials()}
          </div>
        )}
        <div className="text-left hidden sm:block">
          <div className="text-sm font-medium text-gray-900">{getDisplayName()}</div>
          <div className="text-xs text-gray-500">{user.email}</div>
        </div>
        <svg
          className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center gap-3">
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={getDisplayName()}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium">
                    {getInitials()}
                  </div>
                )}
                <div>
                  <div className="font-medium text-gray-900">{getDisplayName()}</div>
                  <div className="text-sm text-gray-500">{user.email}</div>
                  <div className="text-xs text-blue-600 capitalize">
                    {user.subscriptionTier === 'free' ? 'Miễn phí' : 
                     user.subscriptionTier === 'premium' ? 'Premium' : 'Team'}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="py-2">
              <button
                onClick={() => {
                  onShowProfile();
                  setIsOpen(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-2 text-left text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <UserIcon className="w-4 h-4" />
                Thông tin cá nhân
              </button>
              
              <button
                onClick={() => {
                  // TODO: Show settings modal
                  setIsOpen(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-2 text-left text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <CogIcon className="w-4 h-4" />
                Cài đặt
              </button>
            </div>
            
            <div className="border-t border-gray-200 py-2">
              <button
                onClick={() => {
                  onLogout();
                  setIsOpen(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-2 text-left text-red-600 hover:bg-red-50 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Đăng xuất
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};