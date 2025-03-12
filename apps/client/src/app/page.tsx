'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { generateRandomString } from '@/lib/utils';

export default function Home() {
  const router = useRouter();
  const [userName, setUserName] = useState('');
  const [roomId, setRoomId] = useState('');
  const [isCreating, setIsCreating] = useState(false);

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
    
    // 방 페이지로 이동
    router.push(`/room/${roomId}?name=${encodeURIComponent(userName)}`);
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
    
    // 방 페이지로 이동
    router.push(`/room/${newRoomId}?name=${encodeURIComponent(userName)}`);
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="glass rounded-xl p-8 w-full max-w-md">
        <h1 className="text-4xl font-bold text-center mb-8 text-shadow">
          RTBQue
          <span className="block text-lg font-normal mt-2 text-primary-300">동기화된 음악 재생</span>
        </h1>
        
        {isCreating ? (
          <form onSubmit={handleCreateRoom} className="space-y-4">
            <div>
              <label htmlFor="userName" className="block text-sm font-medium mb-1">
                이름
              </label>
              <input
                type="text"
                id="userName"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                className="w-full px-4 py-2 rounded-md bg-dark-700 border border-dark-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="이름을 입력하세요"
                required
              />
            </div>
            
            <div className="pt-4">
              <button
                type="submit"
                className="w-full py-2 px-4 bg-primary-600 hover:bg-primary-700 rounded-md transition-colors"
              >
                방 만들기
              </button>
            </div>
            
            <div className="text-center">
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="text-sm text-primary-300 hover:text-primary-200"
              >
                기존 방에 참가하기
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleJoinRoom} className="space-y-4">
            <div>
              <label htmlFor="userName" className="block text-sm font-medium mb-1">
                이름
              </label>
              <input
                type="text"
                id="userName"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                className="w-full px-4 py-2 rounded-md bg-dark-700 border border-dark-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="이름을 입력하세요"
                required
              />
            </div>
            
            <div>
              <label htmlFor="roomId" className="block text-sm font-medium mb-1">
                방 코드
              </label>
              <input
                type="text"
                id="roomId"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value.toUpperCase())}
                className="w-full px-4 py-2 rounded-md bg-dark-700 border border-dark-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="6자리 코드 입력"
                maxLength={6}
                required
              />
            </div>
            
            <div className="pt-4">
              <button
                type="submit"
                className="w-full py-2 px-4 bg-primary-600 hover:bg-primary-700 rounded-md transition-colors"
              >
                방 참가하기
              </button>
            </div>
            
            <div className="text-center">
              <button
                type="button"
                onClick={() => setIsCreating(true)}
                className="text-sm text-primary-300 hover:text-primary-200"
              >
                새 방 만들기
              </button>
            </div>
          </form>
        )}
      </div>
      
      <footer className="mt-8 text-center text-sm text-dark-300">
        <p>여러 사용자가 동시에 음악을 감상할 수 있는 실시간 동기화 플랫폼</p>
      </footer>
    </main>
  );
} 