import { NextRequest, NextResponse } from 'next/server';

/**
 * YouTube 비디오 정보 API 라우트 핸들러
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const videoId = params.id;
    
    if (!videoId) {
      return NextResponse.json(
        { error: '비디오 ID가 필요합니다' },
        { status: 400 }
      );
    }
    
    // 서버 API URL 구성
    const serverUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
    const apiUrl = `${serverUrl}/api/youtube/video/${videoId}`;
    
    // 서버 API 호출
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      throw new Error(`서버 API 오류: ${response.status}`);
    }
    
    const data = await response.json();
    
    // 결과 반환
    return NextResponse.json(data);
  } catch (error) {
    console.error('YouTube 비디오 정보 API 오류:', error);
    
    return NextResponse.json(
      { error: '비디오 정보를 가져오는 중 오류가 발생했습니다' },
      { status: 500 }
    );
  }
} 