import axios from 'axios';
import { SearchResult } from 'shared';
import { v4 as uuidv4 } from 'uuid';

// YouTube API 키
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;

// YouTube API 검색 함수
export async function searchYouTube(query: string): Promise<SearchResult[]> {
  try {
    if (!YOUTUBE_API_KEY) {
      throw new Error('YouTube API 키가 설정되지 않았습니다.');
    }

    // YouTube API 호출
    const response = await axios.get('https://www.googleapis.com/youtube/v3/search', {
      params: {
        part: 'snippet',
        maxResults: 10,
        q: query,
        type: 'video',
        key: YOUTUBE_API_KEY
      }
    });

    // 검색 결과에서 비디오 ID 추출
    const videoIds = response.data.items.map((item: any) => item.id.videoId).join(',');

    // 비디오 상세 정보 가져오기 (재생 시간 포함)
    const videoDetailsResponse = await axios.get('https://www.googleapis.com/youtube/v3/videos', {
      params: {
        part: 'contentDetails,snippet',
        id: videoIds,
        key: YOUTUBE_API_KEY
      }
    });

    // 검색 결과 매핑
    return videoDetailsResponse.data.items.map((item: any) => {
      // ISO 8601 형식의 재생 시간을 초 단위로 변환
      const duration = parseDuration(item.contentDetails.duration);
      
      return {
        id: uuidv4(),
        title: item.snippet.title,
        thumbnail: item.snippet.thumbnails.medium.url,
        duration: duration,
        youtubeId: item.id
      };
    });
  } catch (error) {
    console.error('YouTube API 오류:', error);
    throw error;
  }
}

// ISO 8601 형식의 재생 시간을 초 단위로 변환하는 함수
function parseDuration(duration: string): number {
  const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
  
  const hours = (match && match[1]) ? parseInt(match[1].slice(0, -1)) : 0;
  const minutes = (match && match[2]) ? parseInt(match[2].slice(0, -1)) : 0;
  const seconds = (match && match[3]) ? parseInt(match[3].slice(0, -1)) : 0;
  
  return hours * 3600 + minutes * 60 + seconds;
} 