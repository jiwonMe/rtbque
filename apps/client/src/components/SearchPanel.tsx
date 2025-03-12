'use client';

import { useState } from 'react';
import { SearchResult } from 'shared';
import { formatTime } from '@/lib/utils';

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
    <div className="bg-dark-800 rounded-lg p-4">
      <h2 className="text-lg font-bold mb-4">음악 검색</h2>
      
      <form onSubmit={handleSearch} className="mb-4">
        <div className="flex">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="노래 제목, 아티스트 검색..."
            className="flex-1 px-4 py-2 rounded-l-md bg-dark-700 border border-dark-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-primary-600 hover:bg-primary-700 rounded-r-md transition-colors"
            disabled={isLoading}
          >
            {isLoading ? '검색 중...' : '검색'}
          </button>
        </div>
      </form>
      
      {error && (
        <div className="text-red-500 mb-4">{error}</div>
      )}
      
      <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
        {results.length > 0 ? (
          results.map((video) => (
            <div
              key={video.id}
              className="flex items-center bg-dark-700 rounded-lg p-2 hover:bg-dark-600 transition-colors"
            >
              <div className="w-16 h-9 bg-dark-600 rounded overflow-hidden flex-shrink-0 mr-3">
                <img
                  src={video.thumbnail || `https://img.youtube.com/vi/${video.youtubeId}/default.jpg`}
                  alt={video.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium truncate">{video.title}</h4>
                <p className="text-xs text-dark-300">{formatTime(video.duration)}</p>
              </div>
              <button
                onClick={() => handleAddVideo(video)}
                className="ml-2 p-1 text-dark-300 hover:text-white"
                title="추가"
              >
                ➕
              </button>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-dark-300">
            {isLoading ? (
              <p>검색 중...</p>
            ) : (
              <p>검색 결과가 없습니다</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 