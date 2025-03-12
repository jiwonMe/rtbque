import express from 'express';
import { SearchResult } from 'shared';
import NodeCache from 'node-cache';
import { google } from 'googleapis';
import axios from 'axios';

const router = express.Router();
const cache = new NodeCache({ stdTTL: 3600 }); // 1시간 캐시

// YouTube API 키
const API_KEY = process.env.YOUTUBE_API_KEY;
console.log('YouTube API Key:', API_KEY); // 디버깅용

// API 키가 없으면 경고
if (!API_KEY) {
  console.error('경고: YouTube API 키가 설정되지 않았습니다. 환경 변수 YOUTUBE_API_KEY를 확인하세요.');
}

// YouTube API 클라이언트 초기화
const youtube = google.youtube('v3');

/**
 * 비디오 검색 API
 */
router.get('/search', async (req, res) => {
  try {
    const query = req.query.q as string;
    
    if (!query) {
      return res.status(400).json({ error: 'Query parameter is required' });
    }
    
    // API 키 확인
    if (!API_KEY) {
      return res.status(500).json({ error: 'YouTube API key is not configured' });
    }
    
    // 캐시에서 결과 확인
    const cacheKey = `search:${query}`;
    const cachedResults = cache.get<SearchResult[]>(cacheKey);
    
    if (cachedResults) {
      return res.json(cachedResults);
    }
    
    console.log(`YouTube API 검색 요청: ${query}, API 키: ${API_KEY.substring(0, 5)}...`); // 디버깅용
    
    // YouTube API 호출
    const response = await youtube.search.list({
      key: API_KEY,
      part: ['snippet'],
      q: query,
      type: ['video'],
      maxResults: 10,
      videoEmbeddable: 'true'
    });
    
    if (!response.data.items || response.data.items.length === 0) {
      return res.json([]);
    }
    
    // 비디오 ID 목록 추출
    const videoIds = response.data.items.map((item: any) => item.id?.videoId).filter(Boolean) as string[];
    
    // 비디오 상세 정보 가져오기
    const videoDetails = await youtube.videos.list({
      key: API_KEY,
      part: ['contentDetails', 'snippet'],
      id: videoIds
    });
    
    // 검색 결과 변환
    const results: SearchResult[] = videoDetails.data.items?.map((item: any) => {
      // ISO 8601 형식의 지속 시간을 초로 변환
      const duration = parseDuration(item.contentDetails?.duration || 'PT0S');
      
      return {
        id: item.id as string,
        title: item.snippet?.title || 'Unknown Title',
        thumbnail: item.snippet?.thumbnails?.medium?.url || '',
        duration,
        youtubeId: item.id as string
      };
    }) || [];
    
    // 결과 캐싱
    cache.set(cacheKey, results);
    
    res.json(results);
  } catch (error) {
    console.error('YouTube API error:', error);
    res.status(500).json({ error: 'Failed to search videos' });
  }
});

/**
 * 비디오 정보 API
 */
router.get('/video/:id', async (req, res) => {
  try {
    const videoId = req.params.id;
    
    if (!videoId) {
      return res.status(400).json({ error: 'Video ID is required' });
    }
    
    // API 키 확인
    if (!API_KEY) {
      return res.status(500).json({ error: 'YouTube API key is not configured' });
    }
    
    // 캐시에서 결과 확인
    const cacheKey = `video:${videoId}`;
    const cachedVideo = cache.get<SearchResult>(cacheKey);
    
    if (cachedVideo) {
      return res.json(cachedVideo);
    }
    
    // YouTube API 호출
    const response = await youtube.videos.list({
      key: API_KEY,
      part: ['snippet', 'contentDetails'],
      id: [videoId]
    });
    
    if (!response.data.items || response.data.items.length === 0) {
      return res.status(404).json({ error: 'Video not found' });
    }
    
    const item = response.data.items[0];
    
    // ISO 8601 형식의 지속 시간을 초로 변환
    const duration = parseDuration(item.contentDetails?.duration || 'PT0S');
    
    const video: SearchResult = {
      id: item.id as string,
      title: item.snippet?.title || 'Unknown Title',
      thumbnail: item.snippet?.thumbnails?.medium?.url || '',
      duration,
      youtubeId: item.id as string
    };
    
    // 결과 캐싱
    cache.set(cacheKey, video);
    
    res.json(video);
  } catch (error) {
    console.error('YouTube API error:', error);
    res.status(500).json({ error: 'Failed to get video info' });
  }
});

/**
 * ISO 8601 형식의 지속 시간을 초로 변환
 */
function parseDuration(duration: string): number {
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  
  if (!match) {
    return 0;
  }
  
  const hours = parseInt(match[1] || '0', 10);
  const minutes = parseInt(match[2] || '0', 10);
  const seconds = parseInt(match[3] || '0', 10);
  
  return hours * 3600 + minutes * 60 + seconds;
}

export const youtubeRouter = router; 