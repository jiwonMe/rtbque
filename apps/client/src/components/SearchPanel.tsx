'use client';

import { useState } from 'react';
import { SearchResult } from 'shared';
import { formatTime, cn } from '@/lib/utils';

interface SearchPanelProps {
  onAddToQueue: (video: SearchResult) => void;
}

export default function SearchPanel({ onAddToQueue }: SearchPanelProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
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
    console.log('비디오 추가 요청:', result);
    onAddToQueue(result);
    // 검색 결과 초기화
    setResults([]);
    setQuery('');
  };
  
  return (
    <div className="bg-dark-800/80 backdrop-blur-sm rounded-lg overflow-hidden border border-dark-700 shadow-lg">
      {/* 헤더 */}
      <div className="bg-dark-900/50 px-4 py-3 border-b border-dark-700">
        <h2 className="text-base font-semibold text-gray-200">음악 검색</h2>
      </div>
      
      {/* 검색 폼 */}
      <div className="p-3">
        <form onSubmit={handleSearch} className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="노래 제목, 아티스트 검색..."
            className={cn(
              "w-full px-4 py-3 pr-12 rounded-lg",
              "bg-dark-700 border border-dark-600",
              "focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent",
              "transition-all placeholder-gray-500"
            )}
          />
          <button
            type="submit"
            className={cn(
              "absolute right-2 top-1/2 transform -translate-y-1/2",
              "p-2 rounded-md text-gray-400 hover:text-white",
              "hover:bg-dark-600 transition-colors",
              isLoading ? "opacity-50 cursor-not-allowed" : ""
            )}
            disabled={isLoading}
          >
            {isLoading ? (
              <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            )}
          </button>
        </form>
      </div>
      
      {/* 에러 메시지 */}
      {error && (
        <div className="px-4 py-2 bg-red-900/30 border-y border-red-800">
          <p className="text-sm text-red-300 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {error}
          </p>
        </div>
      )}
      
      {/* 검색 결과 */}
      <div className="p-2">
        {results.length > 0 ? (
          <div className="space-y-1 max-h-96 overflow-y-auto pr-1">
            {results.map((video) => (
              <div
                key={video.id}
                className={cn(
                  "flex items-center p-2 rounded-md",
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
        ) : !isLoading && query.trim() === '' ? (
          <div className="text-center py-8 text-gray-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mx-auto mb-2 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <p className="text-sm mb-1">원하는 음악을 검색해보세요</p>
            <p className="text-xs">노래 제목, 아티스트 이름으로 검색할 수 있습니다</p>
          </div>
        ) : !isLoading && results.length === 0 && query.trim() !== '' ? (
          <div className="text-center py-8 text-gray-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mx-auto mb-2 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm">검색 결과가 없습니다</p>
          </div>
        ) : null}
      </div>
    </div>
  );
} 