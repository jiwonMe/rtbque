'use client';

import { User } from 'shared';
import { getRandomColor } from '@/lib/utils';
import { useMemo } from 'react';
import { cn } from '@/lib/utils';

interface UserListProps {
  users: User[];
}

export default function UserList({ users }: UserListProps) {
  // 각 사용자에게 고유한 색상 할당
  const userColors = useMemo(() => {
    return users.reduce<Record<string, string>>((colors, user) => {
      colors[user.id] = getRandomColor();
      return colors;
    }, {});
  }, [users.map(u => u.id).join(',')]);
  
  return (
    <div className="bg-dark-800/80 backdrop-blur-sm rounded-lg overflow-hidden border border-dark-700 shadow-lg">
      {/* 헤더 */}
      <div className="bg-dark-900/50 px-4 py-3 border-b border-dark-700">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-200">참가자</h2>
          <span className={cn(
            "inline-flex items-center justify-center px-2 py-1 text-xs font-medium rounded-full",
            "bg-primary-900/50 text-primary-300"
          )}>
            {users.length}명
          </span>
        </div>
      </div>
      
      {/* 사용자 목록 */}
      <div className="p-2">
        {users.length > 0 ? (
          <div className="space-y-1">
            {users.map((user) => (
              <div
                key={user.id}
                className={cn(
                  "flex items-center p-2 rounded-md transition-all",
                  "hover:bg-dark-700/50 hover-scale"
                )}
              >
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-white mr-3",
                    "text-sm font-medium shadow-sm",
                    userColors[user.id]
                  )}
                >
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium truncate">{user.name}</h4>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-gray-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mx-auto mb-2 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <p className="text-sm">참가자가 없습니다</p>
          </div>
        )}
      </div>
    </div>
  );
} 