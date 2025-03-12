'use client';

import { Video } from 'shared';
import { formatTime } from '@/lib/utils';

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
    <div className="bg-dark-800 rounded-lg p-4 mb-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold">재생 목록</h2>
        <span className="text-sm text-dark-300">
          {queue.length}개의 곡
        </span>
      </div>
      
      {currentVideo && (
        <div className="mb-4">
          <h3 className="text-sm font-medium text-dark-300 mb-2">현재 재생 중</h3>
          <div className="flex items-center bg-dark-700 rounded-lg p-2">
            <div className="w-16 h-9 bg-dark-600 rounded overflow-hidden flex-shrink-0 mr-3">
              <img
                src={`https://img.youtube.com/vi/${currentVideo.youtubeId}/default.jpg`}
                alt={currentVideo.title}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-medium truncate">{currentVideo.title}</h4>
              <p className="text-xs text-dark-300">{formatTime(currentVideo.duration)}</p>
            </div>
            <button
              onClick={onSkip}
              className="ml-2 p-1 text-dark-300 hover:text-white"
              title="건너뛰기"
            >
              ⏭️
            </button>
          </div>
        </div>
      )}
      
      {queue.length > 0 ? (
        <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
          {queue.map((video, index) => (
            <div
              key={video.id}
              className="flex items-center bg-dark-700 rounded-lg p-2 hover:bg-dark-600 transition-colors"
            >
              <div className="w-6 h-6 flex items-center justify-center text-dark-300 mr-2">
                {index + 1}
              </div>
              <div className="w-16 h-9 bg-dark-600 rounded overflow-hidden flex-shrink-0 mr-3">
                <img
                  src={`https://img.youtube.com/vi/${video.youtubeId}/default.jpg`}
                  alt={video.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium truncate">{video.title}</h4>
                <p className="text-xs text-dark-300">{formatTime(video.duration)}</p>
              </div>
              <button
                onClick={() => onRemove(video.id)}
                className="ml-2 p-1 text-dark-300 hover:text-white"
                title="제거"
              >
                ❌
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-dark-300">
          <p>대기열에 곡이 없습니다</p>
          <p className="text-sm mt-2">검색을 통해 곡을 추가해보세요</p>
        </div>
      )}
    </div>
  );
} 