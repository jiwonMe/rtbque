'use client';

import { Video } from 'shared';
import { formatTime } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface VideoQueueProps {
  currentVideo: Video | null;
  queue: Video[];
  onRemove: (videoId: string) => void;
  onSkip: () => void;
}

export default function VideoQueue({
  currentVideo,
  queue,
  onRemove,
  onSkip
}: VideoQueueProps) {
  return (
    <div className="bg-dark-800/80 backdrop-blur-sm rounded-lg overflow-hidden border border-dark-700 shadow-lg">
      {/* 헤더 */}
      <div className="bg-dark-900/50 px-4 py-3 border-b border-dark-700">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-200">재생 목록</h2>
          <span className={cn(
            "inline-flex items-center justify-center px-2 py-1 text-xs font-medium rounded-full",
            "bg-primary-900/50 text-primary-300"
          )}>
            {queue.length}개
          </span>
        </div>
      </div>
      
      {/* 현재 재생 중인 비디오 */}
      {currentVideo && (
        <div className="p-3 border-b border-dark-700/50 bg-gradient-to-r from-primary-900/20 to-dark-800/20">
          <h3 className="text-xs font-medium text-primary-400 mb-2 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            현재 재생 중
          </h3>
          <div className={cn(
            "flex items-center p-2 rounded-md",
            "bg-dark-700/50 hover:bg-dark-700 transition-all"
          )}>
            <div className="w-16 h-9 bg-dark-600 rounded overflow-hidden flex-shrink-0 mr-3 shadow-sm">
              <img
                src={`https://img.youtube.com/vi/${currentVideo.youtubeId}/default.jpg`}
                alt={currentVideo.title}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-medium truncate">{currentVideo.title}</h4>
              <div className="flex items-center mt-1">
                <span className="text-xs text-gray-400 mr-2">{formatTime(currentVideo.duration)}</span>
                <span className="text-xs text-gray-500">추가: {currentVideo.addedBy}</span>
              </div>
            </div>
            <button
              onClick={onSkip}
              className={cn(
                "ml-2 p-1.5 rounded-full text-gray-400",
                "hover:text-white hover:bg-dark-600 transition-all"
              )}
              title="건너뛰기"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      )}
      
      {/* 대기열 */}
      <div className="p-2">
        {queue.length > 0 ? (
          <div className="space-y-1 max-h-60 overflow-y-auto pr-1">
            {queue.map((video, index) => (
              <div
                key={video.id}
                className={cn(
                  "flex items-center p-2 rounded-md",
                  "bg-dark-700/50 hover:bg-dark-700 transition-all hover-scale"
                )}
              >
                <div className="w-5 h-5 flex items-center justify-center text-gray-500 mr-2 text-xs font-medium">
                  {index + 1}
                </div>
                <div className="w-16 h-9 bg-dark-600 rounded overflow-hidden flex-shrink-0 mr-3 shadow-sm">
                  <img
                    src={`https://img.youtube.com/vi/${video.youtubeId}/default.jpg`}
                    alt={video.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium truncate">{video.title}</h4>
                  <div className="flex items-center mt-1">
                    <span className="text-xs text-gray-400 mr-2">{formatTime(video.duration)}</span>
                    <span className="text-xs text-gray-500">추가: {video.addedBy}</span>
                  </div>
                </div>
                <button
                  onClick={() => onRemove(video.id)}
                  className={cn(
                    "ml-2 p-1.5 rounded-full text-gray-400",
                    "hover:text-red-400 hover:bg-dark-600 transition-all"
                  )}
                  title="제거"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mx-auto mb-2 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
            </svg>
            <p className="text-sm mb-1">대기열에 곡이 없습니다</p>
            <p className="text-xs">검색을 통해 곡을 추가해보세요</p>
          </div>
        )}
      </div>
    </div>
  );
} 