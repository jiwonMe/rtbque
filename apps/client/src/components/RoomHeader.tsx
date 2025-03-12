'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/useIsMobile';
import Image from 'next/image';
import Link from 'next/link';

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
  const [isLoaded, setIsLoaded] = useState(false);
  const isMobile = useIsMobile();
  
  // 컴포넌트 마운트 시 애니메이션 효과를 위한 상태 설정
  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);
  
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
      "bg-dark-900/90 backdrop-blur-md border-b border-dark-700/70",
      "flex items-center justify-between px-4 py-2",
      "transition-all duration-500",
      isLoaded ? "opacity-100" : "opacity-0 translate-y-[-10px]"
    )}>
      {/* 왼쪽: 로고 및 방 정보 */}
      <div className="flex items-center">
        <Link href="/" className="mr-4 transition-transform duration-300 hover:scale-105">
          <Image 
            src="/assets/logo-white.svg" 
            alt="RTBQue Logo" 
            width={100} 
            height={28} 
            priority
            className="hover:opacity-90 transition-opacity drop-shadow-glow"
          />
        </Link>
        
        <div className="flex items-center">
          <span className="text-sm text-gray-400 mr-1.5">방 코드:</span>
          <button
            onClick={handleCopyRoomId}
            className={cn(
              "px-2.5 py-1.5 rounded-lg text-sm font-mono",
              "bg-dark-800/80 hover:bg-dark-700/80 transition-colors",
              "border border-dark-600/50 hover:border-dark-500/50",
              "flex items-center shadow-sm"
            )}
          >
            <span className="tracking-wider">{roomId}</span>
            <div className={cn(
              "ml-2 w-5 h-5 flex items-center justify-center rounded-full",
              "transition-colors duration-300",
              copied ? "bg-green-500/20" : "bg-dark-700/50"
            )}>
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className={cn(
                  "h-3.5 w-3.5 transition-colors",
                  copied ? "text-green-400" : "text-gray-400"
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
            </div>
          </button>
        </div>
      </div>
      
      {/* 오른쪽: 사용자 정보 및 버튼 */}
      <div className="flex items-center space-x-3">
        {/* 리모컨 모드 토글 버튼 */}
        {onToggleRemoteMode && (
          <button
            onClick={onToggleRemoteMode}
            className={cn(
              "p-2 rounded-full",
              "hover:bg-dark-700/70 transition-all duration-300",
              "border border-transparent",
              isRemoteMode ? 
                "text-primary-400 hover:border-primary-500/30 bg-primary-500/10" : 
                "text-gray-400 hover:text-gray-300"
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
          "px-3.5 py-1.5 rounded-full text-sm",
          "bg-dark-800/70 text-gray-300 border border-dark-600/50",
          "shadow-sm flex items-center"
        )}>
          <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
          {userName}
        </div>
        
        {/* 나가기 버튼 */}
        <button
          onClick={handleLeaveRoom}
          className={cn(
            "p-2 rounded-full",
            "text-gray-400 hover:text-red-400 hover:bg-red-500/10 hover:border-red-500/30",
            "transition-all duration-300 border border-transparent"
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
          "bg-dark-900/80 backdrop-blur-md"
        )}>
          <div className={cn(
            "bg-dark-800/90 rounded-xl shadow-2xl border border-dark-700/70",
            "w-full max-w-sm p-6 animate-fade-in",
            "backdrop-blur-md"
          )}>
            <h3 className="text-lg font-medium mb-3 text-white">방을 나가시겠습니까?</h3>
            <p className="text-gray-400 mb-6">방을 나가면 현재 재생 중인 음악과 대기열이 초기화됩니다.</p>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={cancelLeaveRoom}
                className={cn(
                  "px-4 py-2 rounded-lg",
                  "bg-dark-700/70 hover:bg-dark-600/70 transition-all duration-300",
                  "border border-dark-600/50"
                )}
              >
                취소
              </button>
              <button
                onClick={confirmLeaveRoom}
                className={cn(
                  "px-4 py-2 rounded-lg",
                  "bg-red-600/90 hover:bg-red-500/90 transition-all duration-300",
                  "border border-red-500/50",
                  "relative overflow-hidden group"
                )}
              >
                <span className="relative z-10">나가기</span>
                <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-red-400/0 via-red-400/30 to-red-400/0 transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
} 