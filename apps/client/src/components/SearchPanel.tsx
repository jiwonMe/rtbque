'use client';

import { useState } from 'react';
import { SearchResult } from 'shared';
import { formatTime, cn } from '@/lib/utils';
import { useSocket } from '@/hooks/useSocket';
import { SocketEvents } from 'shared';

interface SearchPanelProps {
  onAddToQueue?: (video: SearchResult) => void;
  roomId?: string;
  onClose?: () => void;
}

export default function SearchPanel({ onAddToQueue, roomId, onClose }: SearchPanelProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { emit } = useSocket();
  
  // 검색 핸들러
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!query.trim()) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/youtube/search?q=${encodeURIComponent(query)}`);
      
      if (!response.ok) {
        throw new Error('검색 중 오류가 발생했습니다');
      }
      
      const data = await response.json();
      setResults(data);
    } catch (err) {
      console.error('Search error:', err);
      setError('검색 중 오류가 발생했습니다');
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };
  
  // 비디오 추가 핸들러
  const handleAddVideo = (result: SearchResult) => {
    if (onAddToQueue) {
      onAddToQueue(result);
      
      // 모달 닫기 (모달로 사용될 때)
      if (onClose) {
        onClose();
      }
    } else if (roomId) {
      // 소켓 이벤트로 직접 전송 (roomId가 제공된 경우)
      emit(SocketEvents.ADD_TO_QUEUE, {
        id: '', // 서버에서 생성
        title: result.title,
        thumbnail: result.thumbnail,
        duration: result.duration,
        youtubeId: result.youtubeId,
        addedBy: '' // 서버에서 설정
      });
      
      // 모달 닫기 (모달로 사용될 때)
      if (onClose) {
        onClose();
      }
    }
  };
  
  return (
    <div className="flex flex-col h-full">
      {/* 헤더 */}
      <div className="px-5 py-4 border-b border-dark-700 mb-2">
        <h2 className="text-base font-semibold text-gray-200 mb-3">음악 검색</h2>
        
        {/* 검색 폼 */}
        <form onSubmit={handleSearch} className="flex">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="노래 제목, 아티스트 검색..."
            className={cn(
              "flex-1 px-4 py-2 rounded-l-lg",
              "bg-dark-700 border border-dark-600",
              "focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
            )}
          />
          <button
            type="submit"
            className={cn(
              "px-4 py-2 rounded-r-lg",
              "bg-primary-600 hover:bg-primary-500 transition-colors",
              "text-white font-medium"
            )}
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-t-transparent border-white rounded-full animate-spin"></div>
            ) : (
              "검색"
            )}
          </button>
        </form>
      </div>
      
      {/* 에러 메시지 */}
      {error && (
        <div className="bg-red-900/30 border border-red-800 text-red-200 px-4 py-3 rounded-md mx-3 mb-3">
          {error}
        </div>
      )}
      
      {/* 검색 결과 */}
      <div className="p-3 flex-1 overflow-y-auto">
        {results.length > 0 ? (
          <div className="space-y-2 max-h-full overflow-y-auto pr-1">
            {results.map((video) => (
              <div
                key={video.id}
                className={cn(
                  "flex items-center p-3 rounded-md",
                  "bg-dark-700/50 hover:bg-dark-700 transition-all hover-scale"
                )}
              >
                <div className="w-16 h-9 bg-dark-600 rounded overflow-hidden flex-shrink-0 mr-3 shadow-sm">
                  <img
                    src={video.thumbnail || `https://img.youtube.com/vi/${video.youtubeId}/default.jpg`}
                    alt={video.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium truncate">{video.title}</h4>
                  <p className="text-xs text-gray-400">{formatTime(video.duration)}</p>
                </div>
                <button
                  onClick={() => handleAddVideo(video)}
                  className={cn(
                    "ml-2 p-1.5 rounded-full text-gray-400",
                    "hover:text-primary-400 hover:bg-dark-600 transition-all"
                  )}
                  title="대기열에 추가"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full p-6 text-gray-500">
            {isLoading ? (
              <div className="w-8 h-8 border-4 border-t-transparent border-primary-500 rounded-full animate-spin mb-4"></div>
            ) : query ? (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-3 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <p>검색 결과가 없습니다</p>
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-3 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                </svg>
                <p>음악을 검색해보세요</p>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 