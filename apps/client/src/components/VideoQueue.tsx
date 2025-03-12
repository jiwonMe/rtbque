'use client';

import { Video } from 'shared';
import { formatTime } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface VideoQueueProps {
  currentVideo?: Video | null;
  queue: Video[];
  onRemove?: (videoId: string) => void;
  onRemoveVideo?: (videoId: string) => void;
  onSkip?: () => void;
}

export default function VideoQueue({
  currentVideo,
  queue,
  onRemove,
  onRemoveVideo,
  onSkip
}: VideoQueueProps) {
  // onRemoveVideo가 제공되면 그것을 사용하고, 아니면 onRemove 사용
  const handleRemove = onRemoveVideo || onRemove;
  
  return (
    <div className={cn(
      "flex flex-col h-full",
      "bg-dark-800/70 rounded-lg"
    )}>
      {/* 헤더 */}
      <div className={cn(
        "px-5 py-4 border-b border-dark-700",
        "flex items-center justify-between"
      )}>
        <h2 className="text-base font-semibold text-gray-200">재생 목록</h2>
        <span className={cn(
          "inline-flex items-center justify-center px-2.5 py-1 text-xs font-medium rounded-full",
          "bg-primary-900/50 text-primary-300"
        )}>
          {queue.length}개
        </span>
      </div>
      
      {/* 현재 재생 중인 비디오 */}
      {currentVideo && (
        <div className={cn(
          "p-4 border-b border-dark-700/50",
          "bg-gradient-to-r from-primary-900/20 to-dark-800/20"
        )}>
          <h3 className="text-xs font-medium text-primary-400 mb-2 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            현재 재생 중
          </h3>
          <div className={cn(
            "flex items-center p-3 rounded-md",
            "bg-dark-700/50 hover:bg-dark-700 transition-all"
          )}>
            <div className="w-16 h-9 bg-dark-600 rounded overflow-hidden flex-shrink-0 mr-3 shadow-sm">
              <img
                src={currentVideo.thumbnail || `https://img.youtube.com/vi/${currentVideo.youtubeId}/default.jpg`}
                alt={currentVideo.title}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-medium truncate">{currentVideo.title}</h4>
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>추가: {currentVideo.addedBy}</span>
                <span>{formatTime(currentVideo.duration)}</span>
              </div>
            </div>
            {onSkip && (
              <button
                onClick={onSkip}
                className={cn(
                  "ml-2 p-1.5 rounded-full text-gray-400",
                  "hover:text-primary-400 hover:bg-dark-600 transition-all"
                )}
                title="건너뛰기"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                </svg>
              </button>
            )}
          </div>
        </div>
      )}
      
      {/* 대기열 목록 */}
      <div className="flex-1 overflow-y-auto px-2">
        {queue.length > 0 ? (
          <div className="divide-y divide-dark-700/30">
            {queue.map((video, index) => (
              <div 
                key={video.id}
                className={cn(
                  "flex items-center p-3 my-2 rounded-md",
                  "hover:bg-dark-750 transition-colors"
                )}
              >
                <div className="w-10 h-10 flex items-center justify-center text-gray-500 mr-3">
                  {index + 1}
                </div>
                <div className="w-16 h-9 bg-dark-600 rounded overflow-hidden flex-shrink-0 mr-3 shadow-sm">
                  <img
                    src={video.thumbnail || `https://img.youtube.com/vi/${video.youtubeId}/default.jpg`}
                    alt={video.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium truncate">{video.title}</h4>
                  <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>추가: {video.addedBy}</span>
                    <span>{formatTime(video.duration)}</span>
                  </div>
                </div>
                {handleRemove && (
                  <button
                    onClick={() => handleRemove(video.id)}
                    className={cn(
                      "ml-2 p-1.5 rounded-full text-gray-400",
                      "hover:text-red-400 hover:bg-dark-600 transition-all"
                    )}
                    title="제거"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center h-full p-6 text-gray-500">
            대기열이 비어있습니다
          </div>
        )}
      </div>
    </div>
  );
} 