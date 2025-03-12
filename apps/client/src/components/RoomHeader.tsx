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
  const [showConfirm, setShowConfirm] = useState(false);
  
  // 방 코드 복사 핸들러
  const handleCopyRoomId = () => {
    navigator.clipboard.writeText(roomId);
    setCopied(true);
    
    // 3초 후 복사 상태 초기화
    setTimeout(() => setCopied(false), 3000);
  };
  
  // 방 나가기 핸들러
  const handleLeaveRoom = () => {
    setShowConfirm(true);
  };
  
  // 방 나가기 확인
  const confirmLeaveRoom = () => {
    router.push('/');
  };
  
  // 방 나가기 취소
  const cancelLeaveRoom = () => {
    setShowConfirm(false);
  };
  
  return (
    <header className="bg-gradient-to-r from-dark-900 to-dark-800 border-b border-dark-700 shadow-md">
      <div className="container mx-auto px-4 py-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* 방 정보 */}
          <div className="flex items-center">
            <div className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center mr-3",
              "bg-gradient-to-br from-primary-500 to-primary-700 text-white font-bold text-lg"
            )}>
              {roomName.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-xl font-bold">{roomName}</h1>
              <div className="flex items-center mt-1">
                <span className="text-xs text-gray-400 mr-2">방 코드:</span>
                <div className="bg-dark-700 px-2 py-1 rounded text-xs font-mono tracking-wider">
                  {roomId}
                </div>
                <button
                  onClick={handleCopyRoomId}
                  className={cn(
                    "ml-2 text-xs px-2 py-1 rounded-md transition-all",
                    copied 
                      ? "bg-green-600 text-white" 
                      : "bg-dark-700 text-gray-300 hover:bg-dark-600"
                  )}
                >
                  {copied ? '복사됨!' : '복사'}
                </button>
              </div>
            </div>
          </div>
          
          {/* 액션 버튼 */}
          <div className="flex items-center space-x-3">
            <button
              onClick={handleLeaveRoom}
              className={cn(
                "flex items-center px-3 py-2 rounded-md text-sm font-medium transition-all",
                "bg-dark-700 hover:bg-dark-600 text-gray-300",
                "border border-dark-600 hover:border-dark-500"
              )}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              방 나가기
            </button>
          </div>
        </div>
      </div>
      
      {/* 방 나가기 확인 모달 */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-dark-800 rounded-lg p-6 max-w-sm w-full mx-4 shadow-2xl border border-dark-700">
            <h3 className="text-lg font-bold mb-4">방을 나가시겠습니까?</h3>
            <p className="text-gray-400 mb-6">방을 나가면 현재 재생 중인 음악과 대기열이 초기화됩니다.</p>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={cancelLeaveRoom}
                className="px-4 py-2 rounded-md bg-dark-700 hover:bg-dark-600 transition-colors"
              >
                취소
              </button>
              <button
                onClick={confirmLeaveRoom}
                className="px-4 py-2 rounded-md bg-red-600 hover:bg-red-700 transition-colors"
              >
                나가기
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
} 