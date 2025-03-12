'use client';

import { useState, useEffect } from 'react';
import { Video } from 'shared';
import { cn, formatTime } from '@/lib/utils';
import { useSocket } from '@/hooks/useSocket';
import { SocketEvents } from 'shared';
import SearchPanel from '@/components/SearchPanel';

interface RemoteControlProps {
  roomId: string;
  currentVideo: Video | null;
  isPlaying: boolean;
  currentTime: number;
  queue: Video[];
  onPlay: () => void;
  onPause: () => void;
  onSeek: (time: number) => void;
  onSkip: () => void;
}

export default function RemoteControl({
  roomId,
  currentVideo,
  isPlaying,
  currentTime,
  queue,
  onPlay,
  onPause,
  onSeek,
  onSkip
}: RemoteControlProps) {
  const [showSearch, setShowSearch] = useState(false);
  const [progress, setProgress] = useState(0);
  const [displayTime, setDisplayTime] = useState(currentTime);
  const { emit } = useSocket();

  // 현재 시간 및 진행률 업데이트
  useEffect(() => {
    if (!currentVideo) return;
    
    const progressPercent = (currentTime / currentVideo.duration) * 100;
    setProgress(progressPercent);
    setDisplayTime(currentTime);
    
    // 재생 중일 때만 타이머 설정
    if (isPlaying) {
      const timer = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            clearInterval(timer);
            return 100;
          }
          return prev + (100 / currentVideo.duration / 10); // 100ms마다 업데이트
        });
        
        setDisplayTime(prev => {
          const newTime = prev + 0.1; // 100ms마다 0.1초씩 증가
          if (newTime >= currentVideo.duration) {
            return currentVideo.duration;
          }
          return newTime;
        });
      }, 100);
      
      return () => clearInterval(timer);
    }
  }, [currentVideo, currentTime, isPlaying]);

  // 서버에서 새로운 currentTime을 받았을 때 displayTime 업데이트
  useEffect(() => {
    setDisplayTime(currentTime);
  }, [currentTime]);

  // 재생/일시정지 토글
  const handlePlayPause = () => {
    if (isPlaying) {
      onPause();
    } else {
      onPlay();
    }
  };

  // 검색 패널 토글
  const toggleSearch = () => {
    setShowSearch(!showSearch);
  };

  return (
    <div className={cn(
      "w-full flex flex-col h-full",
      "bg-dark-900 text-white"
    )}>
      {/* 현재 재생 중인 곡 정보 */}
      <div className={cn(
        "p-4 border-b border-dark-700",
        "flex flex-col"
      )}>
        <h2 className="text-lg font-semibold mb-1">현재 재생 중</h2>
        {currentVideo ? (
          <div className={cn(
            "flex items-center",
            "bg-dark-800 rounded-lg p-3"
          )}>
            <div className="flex-1">
              <h3 className="font-medium text-primary-400 truncate">{currentVideo.title}</h3>
              <div className="flex justify-between text-sm text-gray-400 mt-1">
                <span>추가: {currentVideo.addedBy}</span>
                <span>{formatTime(displayTime)} / {formatTime(currentVideo.duration)}</span>
              </div>
              
              {/* 진행 바 */}
              <div className={cn(
                "mt-2 h-1 w-full bg-dark-700 rounded-full overflow-hidden"
              )}>
                <div 
                  className="h-full bg-primary-500 rounded-full"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>
        ) : (
          <div className={cn(
            "flex items-center justify-center",
            "bg-dark-800 rounded-lg p-6 text-gray-500"
          )}>
            재생 중인 곡이 없습니다
          </div>
        )}
      </div>
      
      {/* 컨트롤 버튼 */}
      <div className={cn(
        "flex justify-center items-center gap-4 p-4",
        "border-b border-dark-700"
      )}>
        <button
          onClick={onSkip}
          disabled={!currentVideo}
          className={cn(
            "p-3 rounded-full",
            "bg-dark-800 hover:bg-dark-700 transition-colors",
            "disabled:opacity-50 disabled:cursor-not-allowed"
          )}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="5 4 15 12 5 20 5 4"></polygon>
            <line x1="19" y1="5" x2="19" y2="19"></line>
          </svg>
        </button>
        
        <button
          onClick={handlePlayPause}
          disabled={!currentVideo}
          className={cn(
            "p-4 rounded-full",
            "bg-primary-600 hover:bg-primary-500 transition-colors",
            "disabled:opacity-50 disabled:cursor-not-allowed"
          )}
        >
          {isPlaying ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="6" y="4" width="4" height="16"></rect>
              <rect x="14" y="4" width="4" height="16"></rect>
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="5 3 19 12 5 21 5 3"></polygon>
            </svg>
          )}
        </button>
        
        <button
          onClick={toggleSearch}
          className={cn(
            "p-3 rounded-full",
            "bg-dark-800 hover:bg-dark-700 transition-colors",
            showSearch ? "bg-primary-600 hover:bg-primary-500" : ""
          )}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
        </button>
      </div>
      
      {/* 검색 패널 또는 대기열 */}
      <div className="flex-1 overflow-hidden">
        {showSearch ? (
          <div className="h-full">
            <SearchPanel roomId={roomId} onClose={toggleSearch} />
          </div>
        ) : (
          <div className="h-full overflow-y-auto p-4">
            <h2 className="text-lg font-semibold mb-3">대기열</h2>
            {queue.length > 0 ? (
              <div className="space-y-2">
                {queue.map((video) => (
                  <div 
                    key={video.id}
                    className={cn(
                      "flex items-center p-3 rounded-lg",
                      "bg-dark-800 hover:bg-dark-750 transition-colors"
                    )}
                  >
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-sm truncate">{video.title}</h3>
                      <div className="flex justify-between text-xs text-gray-400 mt-1">
                        <span>추가: {video.addedBy}</span>
                        <span>{formatTime(video.duration)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className={cn(
                "flex items-center justify-center",
                "bg-dark-800 rounded-lg p-6 text-gray-500"
              )}>
                대기열이 비어있습니다
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* 하단 정보 */}
      <div className={cn(
        "p-3 text-center text-xs text-gray-500",
        "border-t border-dark-700"
      )}>
        방 코드: <span className="font-mono font-medium text-primary-400">{roomId}</span>
        <p className="mt-1">리모컨 모드</p>
      </div>
    </div>
  );
} 