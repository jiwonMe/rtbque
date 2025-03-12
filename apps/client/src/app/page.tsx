'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { generateRandomString, cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/useIsMobile';
import Image from 'next/image';

export default function Home() {
  const router = useRouter();
  const [userName, setUserName] = useState('');
  const [roomId, setRoomId] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [remoteMode, setRemoteMode] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const isMobile = useIsMobile();

  // 컴포넌트 마운트 시 모바일 환경이면 기본적으로 리모컨 모드 활성화
  useEffect(() => {
    if (isMobile) {
      setRemoteMode(true);
    }
    
    // 페이지 로드 애니메이션을 위한 상태 설정
    const timer = setTimeout(() => setIsLoaded(true), 100);
    return () => clearTimeout(timer);
  }, [isMobile]);

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
    <main className={cn(
      "min-h-screen flex flex-col items-center justify-center p-4",
      "bg-gradient-to-br from-dark-900 via-dark-800 to-dark-950",
      "relative overflow-hidden"
    )}>
      {/* 배경 장식 요소 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full opacity-10">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-primary-500/20 blur-3xl animate-float-slow"></div>
          <div className="absolute bottom-1/3 right-1/4 w-80 h-80 rounded-full bg-secondary-500/20 blur-3xl animate-float-slow-reverse"></div>
          <div className="absolute top-2/3 right-1/3 w-64 h-64 rounded-full bg-primary-600/20 blur-3xl animate-float"></div>
        </div>
      </div>
      
      {/* 메인 콘텐츠 */}
      <div className={cn(
        "w-full max-w-md z-10 transition-all duration-700 transform",
        isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      )}>
        {/* 로고 및 제목 */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <Image 
              src="/assets/logo-white.svg" 
              alt="RTBQue Logo" 
              width={220} 
              height={60} 
              priority
              className="animate-pulse-subtle drop-shadow-glow"
            />
          </div>
          <p className={cn(
            "text-lg text-gray-300 font-light tracking-wide",
            "animate-fade-in opacity-0",
            "animation-delay-300"
          )}>
            함께 음악을 즐기는 실시간 공간
          </p>
        </div>
        
        {/* 카드 컨테이너 */}
        <div className={cn(
          "glass rounded-2xl overflow-hidden shadow-2xl border border-white/10",
          "backdrop-blur-xl transition-all duration-300",
          "hover:shadow-primary-500/20 hover:border-white/20"
        )}>
          {/* 탭 네비게이션 */}
          <div className="flex border-b border-dark-700/70">
            <button
              onClick={() => setIsCreating(false)}
              className={cn(
                "flex-1 py-4 text-center transition-all duration-300 font-medium",
                !isCreating 
                  ? "bg-dark-800/70 text-primary-400 border-b-2 border-primary-500" 
                  : "text-gray-400 hover:text-gray-300 hover:bg-dark-800/30"
              )}
            >
              방 참가하기
            </button>
            <button
              onClick={() => setIsCreating(true)}
              className={cn(
                "flex-1 py-4 text-center transition-all duration-300 font-medium",
                isCreating 
                  ? "bg-dark-800/70 text-primary-400 border-b-2 border-primary-500" 
                  : "text-gray-400 hover:text-gray-300 hover:bg-dark-800/30"
              )}
            >
              새 방 만들기
            </button>
          </div>
          
          {/* 폼 컨테이너 */}
          <div className="p-8">
            {isCreating ? (
              <form onSubmit={handleCreateRoom} className="space-y-6">
                <div className="space-y-2">
                  <label htmlFor="create-userName" className="block text-sm font-medium text-gray-300">
                    이름
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      id="create-userName"
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                      className={cn(
                        "w-full px-4 py-3 rounded-lg",
                        "bg-dark-700/70 border border-dark-600/70",
                        "focus:outline-none focus:ring-2 focus:ring-primary-500/70 focus:border-transparent",
                        "transition-all duration-300 placeholder-gray-500"
                      )}
                      placeholder="이름을 입력하세요"
                      required
                    />
                    <div className="absolute inset-0 rounded-lg pointer-events-none border border-white/5 border-t-transparent border-l-transparent opacity-20"></div>
                  </div>
                </div>
                
                {/* 리모컨 모드 체크박스 */}
                <div className="flex items-center">
                  <div className="relative">
                    <input
                      type="checkbox"
                      id="create-remoteMode"
                      checked={remoteMode}
                      onChange={toggleRemoteMode}
                      className={cn(
                        "h-5 w-5 rounded border-dark-600",
                        "focus:ring-primary-500 bg-dark-700/70",
                        "text-primary-500 transition-colors duration-200"
                      )}
                    />
                    <div className="absolute inset-0 rounded pointer-events-none border border-white/5 border-t-transparent border-l-transparent opacity-20"></div>
                  </div>
                  <label htmlFor="create-remoteMode" className="ml-2 block text-sm text-gray-300">
                    리모컨 모드 {isMobile && <span className="text-primary-400/80">(모바일에 최적화)</span>}
                  </label>
                </div>
                
                <button
                  type="submit"
                  className={cn(
                    "w-full py-3.5 px-4 rounded-lg font-medium",
                    "bg-gradient-to-r from-primary-600 to-primary-500",
                    "hover:from-primary-500 hover:to-primary-400",
                    "focus:ring-2 focus:ring-primary-500/50 focus:ring-offset-2 focus:ring-offset-dark-800",
                    "transition-all duration-300 transform hover:scale-[1.02]",
                    "shadow-lg shadow-primary-500/20",
                    "relative overflow-hidden group"
                  )}
                >
                  <span className="relative z-10">새 방 만들기</span>
                  <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-primary-400/0 via-primary-400/30 to-primary-400/0 transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                </button>
              </form>
            ) : (
              <form onSubmit={handleJoinRoom} className="space-y-6">
                <div className="space-y-2">
                  <label htmlFor="join-userName" className="block text-sm font-medium text-gray-300">
                    이름
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      id="join-userName"
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                      className={cn(
                        "w-full px-4 py-3 rounded-lg",
                        "bg-dark-700/70 border border-dark-600/70",
                        "focus:outline-none focus:ring-2 focus:ring-primary-500/70 focus:border-transparent",
                        "transition-all duration-300 placeholder-gray-500"
                      )}
                      placeholder="이름을 입력하세요"
                      required
                    />
                    <div className="absolute inset-0 rounded-lg pointer-events-none border border-white/5 border-t-transparent border-l-transparent opacity-20"></div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="roomId" className="block text-sm font-medium text-gray-300">
                    방 코드
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      id="roomId"
                      value={roomId}
                      onChange={(e) => setRoomId(e.target.value.toUpperCase())}
                      className={cn(
                        "w-full px-4 py-3 rounded-lg uppercase font-mono tracking-wider",
                        "bg-dark-700/70 border border-dark-600/70",
                        "focus:outline-none focus:ring-2 focus:ring-primary-500/70 focus:border-transparent",
                        "transition-all duration-300 placeholder-gray-500"
                      )}
                      placeholder="6자리 코드 입력"
                      maxLength={6}
                      required
                    />
                    <div className="absolute inset-0 rounded-lg pointer-events-none border border-white/5 border-t-transparent border-l-transparent opacity-20"></div>
                  </div>
                </div>
                
                {/* 리모컨 모드 체크박스 */}
                <div className="flex items-center">
                  <div className="relative">
                    <input
                      type="checkbox"
                      id="join-remoteMode"
                      checked={remoteMode}
                      onChange={toggleRemoteMode}
                      className={cn(
                        "h-5 w-5 rounded border-dark-600",
                        "focus:ring-primary-500 bg-dark-700/70",
                        "text-primary-500 transition-colors duration-200"
                      )}
                    />
                    <div className="absolute inset-0 rounded pointer-events-none border border-white/5 border-t-transparent border-l-transparent opacity-20"></div>
                  </div>
                  <label htmlFor="join-remoteMode" className="ml-2 block text-sm text-gray-300">
                    리모컨 모드 {isMobile && <span className="text-primary-400/80">(모바일에 최적화)</span>}
                  </label>
                </div>
                
                <button
                  type="submit"
                  className={cn(
                    "w-full py-3.5 px-4 rounded-lg font-medium",
                    "bg-gradient-to-r from-primary-600 to-primary-500",
                    "hover:from-primary-500 hover:to-primary-400",
                    "focus:ring-2 focus:ring-primary-500/50 focus:ring-offset-2 focus:ring-offset-dark-800",
                    "transition-all duration-300 transform hover:scale-[1.02]",
                    "shadow-lg shadow-primary-500/20",
                    "relative overflow-hidden group"
                  )}
                >
                  <span className="relative z-10">방 참가하기</span>
                  <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-primary-400/0 via-primary-400/30 to-primary-400/0 transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                </button>
              </form>
            )}
          </div>
        </div>
        
        {/* 푸터 */}
        <div className={cn(
          "mt-10 text-center text-sm text-gray-500",
          "animate-fade-in opacity-0",
          "animation-delay-500"
        )}>
          <p>친구들과 함께 음악을 즐겨보세요!</p>
          <p className="mt-2">© 2024 RTBQue</p>
        </div>
      </div>
    </main>
  );
} 