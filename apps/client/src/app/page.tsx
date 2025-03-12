'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { generateRandomString, cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/useIsMobile';

export default function Home() {
  const router = useRouter();
  const [userName, setUserName] = useState('');
  const [roomId, setRoomId] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [remoteMode, setRemoteMode] = useState(false);
  const isMobile = useIsMobile();

  // 컴포넌트 마운트 시 모바일 환경이면 기본적으로 리모컨 모드 활성화
  useState(() => {
    if (isMobile) {
      setRemoteMode(true);
    }
  });

  // 방 참가 핸들러
  const handleJoinRoom = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userName) {
      alert('이름을 입력해주세요.');
      return;
    }
    
    if (!roomId) {
      alert('방 코드를 입력해주세요.');
      return;
    }
    
    // 방 페이지로 이동 (리모컨 모드 파라미터 추가)
    router.push(`/room/${roomId}?name=${encodeURIComponent(userName)}${remoteMode ? '&remote=true' : ''}`);
  };

  // 방 생성 핸들러
  const handleCreateRoom = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userName) {
      alert('이름을 입력해주세요.');
      return;
    }
    
    // 랜덤 방 코드 생성
    const newRoomId = generateRandomString(6).toUpperCase();
    
    // 방 페이지로 이동 (리모컨 모드 파라미터 추가)
    router.push(`/room/${newRoomId}?name=${encodeURIComponent(userName)}${remoteMode ? '&remote=true' : ''}`);
  };

  // 리모컨 모드 토글 핸들러
  const toggleRemoteMode = () => {
    setRemoteMode(!remoteMode);
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-gradient-to-br from-dark-800/50 to-dark-900/50">
      <div className="w-full max-w-md animate-fade-in">
        {/* 로고 및 제목 */}
        <div className="text-center mb-10">
          <h1 className={cn(
            "text-5xl font-bold mb-3 text-shadow",
            "bg-clip-text text-transparent bg-gradient-to-r from-primary-400 to-secondary-400"
          )}>
            RTBQue
          </h1>
          <p className="text-lg text-gray-300">함께 음악을 즐기는 실시간 공간</p>
        </div>
        
        {/* 카드 컨테이너 */}
        <div className="glass rounded-xl overflow-hidden shadow-2xl">
          {/* 탭 네비게이션 */}
          <div className="flex border-b border-dark-700">
            <button
              onClick={() => setIsCreating(false)}
              className={cn(
                "flex-1 py-4 text-center transition-colors font-medium",
                !isCreating 
                  ? "bg-dark-800 text-primary-400 border-b-2 border-primary-500" 
                  : "text-gray-400 hover:text-gray-300"
              )}
            >
              방 참가하기
            </button>
            <button
              onClick={() => setIsCreating(true)}
              className={cn(
                "flex-1 py-4 text-center transition-colors font-medium",
                isCreating 
                  ? "bg-dark-800 text-primary-400 border-b-2 border-primary-500" 
                  : "text-gray-400 hover:text-gray-300"
              )}
            >
              새 방 만들기
            </button>
          </div>
          
          {/* 폼 컨테이너 */}
          <div className="p-6">
            {isCreating ? (
              <form onSubmit={handleCreateRoom} className="space-y-5">
                <div className="space-y-1">
                  <label htmlFor="create-userName" className="block text-sm font-medium text-gray-300">
                    이름
                  </label>
                  <input
                    type="text"
                    id="create-userName"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg bg-dark-700 border border-dark-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                    placeholder="이름을 입력하세요"
                    required
                  />
                </div>
                
                {/* 리모컨 모드 체크박스 */}
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="create-remoteMode"
                    checked={remoteMode}
                    onChange={toggleRemoteMode}
                    className="h-4 w-4 text-primary-500 rounded border-dark-600 focus:ring-primary-500 bg-dark-700"
                  />
                  <label htmlFor="create-remoteMode" className="ml-2 block text-sm text-gray-300">
                    리모컨 모드 {isMobile && "(모바일에 최적화)"}
                  </label>
                </div>
                
                <button
                  type="submit"
                  className={cn(
                    "w-full py-3 px-4 rounded-lg font-medium transition-all",
                    "bg-gradient-to-r from-primary-600 to-primary-500",
                    "hover:from-primary-500 hover:to-primary-400",
                    "focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-dark-800",
                    "hover-scale"
                  )}
                >
                  새 방 만들기
                </button>
              </form>
            ) : (
              <form onSubmit={handleJoinRoom} className="space-y-5">
                <div className="space-y-1">
                  <label htmlFor="join-userName" className="block text-sm font-medium text-gray-300">
                    이름
                  </label>
                  <input
                    type="text"
                    id="join-userName"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg bg-dark-700 border border-dark-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                    placeholder="이름을 입력하세요"
                    required
                  />
                </div>
                
                <div className="space-y-1">
                  <label htmlFor="roomId" className="block text-sm font-medium text-gray-300">
                    방 코드
                  </label>
                  <input
                    type="text"
                    id="roomId"
                    value={roomId}
                    onChange={(e) => setRoomId(e.target.value.toUpperCase())}
                    className="w-full px-4 py-3 rounded-lg bg-dark-700 border border-dark-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all uppercase"
                    placeholder="6자리 코드 입력"
                    maxLength={6}
                    required
                  />
                </div>
                
                {/* 리모컨 모드 체크박스 */}
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="join-remoteMode"
                    checked={remoteMode}
                    onChange={toggleRemoteMode}
                    className="h-4 w-4 text-primary-500 rounded border-dark-600 focus:ring-primary-500 bg-dark-700"
                  />
                  <label htmlFor="join-remoteMode" className="ml-2 block text-sm text-gray-300">
                    리모컨 모드 {isMobile && "(모바일에 최적화)"}
                  </label>
                </div>
                
                <button
                  type="submit"
                  className={cn(
                    "w-full py-3 px-4 rounded-lg font-medium transition-all",
                    "bg-gradient-to-r from-primary-600 to-primary-500",
                    "hover:from-primary-500 hover:to-primary-400",
                    "focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-dark-800",
                    "hover-scale"
                  )}
                >
                  방 참가하기
                </button>
              </form>
            )}
          </div>
        </div>
        
        {/* 푸터 */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>친구들과 함께 음악을 즐겨보세요!</p>
          <p className="mt-2">© 2024 RTBQue</p>
        </div>
      </div>
    </main>
  );
} 