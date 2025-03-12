'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

interface RoomHeaderProps {
  roomId: string;
  roomName: string;
}

export default function RoomHeader({ roomId, roomName }: RoomHeaderProps) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  
  // 방 코드 복사 핸들러
  const handleCopyRoomId = () => {
    navigator.clipboard.writeText(roomId);
    setCopied(true);
    
    // 3초 후 복사 상태 초기화
    setTimeout(() => setCopied(false), 3000);
  };
  
  // 방 나가기 핸들러
  const handleLeaveRoom = () => {
    if (confirm('정말 방을 나가시겠습니까?')) {
      router.push('/');
    }
  };
  
  return (
    <header className="bg-dark-800 border-b border-dark-700 p-4">
      <div className="container mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center">
          <h1 className="text-xl font-bold mr-4">{roomName}</h1>
          <div className="flex items-center space-x-2">
            <div className="bg-dark-700 px-3 py-1 rounded text-sm font-mono">
              {roomId}
            </div>
            <button
              onClick={handleCopyRoomId}
              className={cn(
                "text-sm px-2 py-1 rounded transition-colors",
                copied 
                  ? "bg-green-600 hover:bg-green-700" 
                  : "bg-dark-600 hover:bg-dark-500"
              )}
            >
              {copied ? '복사됨!' : '복사'}
            </button>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <button
            onClick={handleLeaveRoom}
            className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded transition-colors"
          >
            방 나가기
          </button>
        </div>
      </div>
    </header>
  );
} 