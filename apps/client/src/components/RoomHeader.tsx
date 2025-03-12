'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/useIsMobile';

interface RoomHeaderProps {
  roomId: string;
  roomName?: string;
  userName: string;
  isRemoteMode?: boolean;
  onToggleRemoteMode?: () => void;
}

export default function RoomHeader({ 
  roomId, 
  roomName = '음악 방', 
  userName,
  isRemoteMode = false,
  onToggleRemoteMode
}: RoomHeaderProps) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const isMobile = useIsMobile();
  
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
    <header className={cn(
      "bg-dark-900 border-b border-dark-700",
      "flex items-center justify-between px-4 py-2"
    )}>
      {/* 왼쪽: 로고 및 방 정보 */}
      <div className="flex items-center">
        <h1 className={cn(
          "text-xl font-bold mr-3",
          "bg-clip-text text-transparent bg-gradient-to-r from-primary-400 to-secondary-400"
        )}>
          RTBQue
        </h1>
        
        <div className="flex items-center">
          <span className="text-sm text-gray-400 mr-1">방 코드:</span>
          <button
            onClick={handleCopyRoomId}
            className={cn(
              "px-2 py-1 rounded text-sm font-mono",
              "bg-dark-800 hover:bg-dark-700 transition-colors",
              "flex items-center"
            )}
          >
            {roomId}
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className={cn(
                "h-4 w-4 ml-1.5 transition-colors",
                copied ? "text-green-500" : "text-gray-400"
              )} 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              {copied ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              )}
            </svg>
          </button>
        </div>
      </div>
      
      {/* 오른쪽: 사용자 정보 및 버튼 */}
      <div className="flex items-center space-x-2">
        {/* 리모컨 모드 토글 버튼 */}
        {onToggleRemoteMode && (
          <button
            onClick={onToggleRemoteMode}
            className={cn(
              "p-2 rounded-full",
              "hover:bg-dark-700 transition-colors",
              isRemoteMode ? "text-primary-400" : "text-gray-400"
            )}
            title={isRemoteMode ? "일반 모드로 전환" : "리모컨 모드로 전환"}
          >
            {isRemoteMode ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                <line x1="8" y1="21" x2="16" y2="21"></line>
                <line x1="12" y1="17" x2="12" y2="21"></line>
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10 2L3 14h9l-1 8 7-12h-9l1-8z"></path>
              </svg>
            )}
          </button>
        )}
        
        {/* 사용자 이름 */}
        <div className={cn(
          "px-3 py-1 rounded-full text-sm",
          "bg-dark-800 text-gray-300"
        )}>
          {userName}
        </div>
        
        {/* 나가기 버튼 */}
        <button
          onClick={handleLeaveRoom}
          className={cn(
            "p-2 rounded-full",
            "text-gray-400 hover:text-red-400 hover:bg-dark-700 transition-colors"
          )}
          title="방 나가기"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
            <polyline points="16 17 21 12 16 7"></polyline>
            <line x1="21" y1="12" x2="9" y2="12"></line>
          </svg>
        </button>
      </div>
      
      {/* 나가기 확인 모달 */}
      {showConfirm && (
        <div className={cn(
          "fixed inset-0 z-50 flex items-center justify-center p-4",
          "bg-dark-900/80 backdrop-blur-sm"
        )}>
          <div className={cn(
            "bg-dark-800 rounded-lg shadow-xl border border-dark-700",
            "w-full max-w-sm p-5 animate-fade-in"
          )}>
            <h3 className="text-lg font-medium mb-3">방을 나가시겠습니까?</h3>
            <p className="text-gray-400 mb-5">방을 나가면 현재 재생 중인 음악과 대기열이 초기화됩니다.</p>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={cancelLeaveRoom}
                className={cn(
                  "px-4 py-2 rounded-lg",
                  "bg-dark-700 hover:bg-dark-600 transition-colors"
                )}
              >
                취소
              </button>
              <button
                onClick={confirmLeaveRoom}
                className={cn(
                  "px-4 py-2 rounded-lg",
                  "bg-red-600 hover:bg-red-500 transition-colors"
                )}
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