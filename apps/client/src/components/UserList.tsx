'use client';

import { User } from 'shared';
import { getRandomColor } from '@/lib/utils';
import { useMemo } from 'react';

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
    <div className="bg-dark-800 rounded-lg p-4">
      <h2 className="text-lg font-bold mb-4">참가자 ({users.length}명)</h2>
      
      {users.length > 0 ? (
        <div className="space-y-2">
          {users.map((user) => (
            <div
              key={user.id}
              className="flex items-center p-2 rounded-lg hover:bg-dark-700 transition-colors"
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-white mr-3 ${userColors[user.id]}`}
              >
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-medium">{user.name}</h4>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-4 text-dark-300">
          <p>참가자가 없습니다</p>
        </div>
      )}
    </div>
  );
} 