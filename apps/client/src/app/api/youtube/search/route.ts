import { NextRequest, NextResponse } from 'next/server';

/**
 * YouTube 검색 API 라우트 핸들러
 */
export async function GET(request: NextRequest) {
  try {
    // URL에서 검색어 추출
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q');
    
    if (!query) {
      return NextResponse.json(
        { error: '검색어가 필요합니다' },
        { status: 400 }
      );
    }
    
    // 서버 API URL 구성
    const serverUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
    const apiUrl = `${serverUrl}/api/search?q=${encodeURIComponent(query)}`;
    
    // 서버 API 호출
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      throw new Error(`서버 API 오류: ${response.status}`);
    }
    
    const data = await response.json();
    
    // 결과 반환
    return NextResponse.json(data);
  } catch (error) {
    console.error('YouTube 검색 API 오류:', error);
    
    return NextResponse.json(
      { error: '검색 중 오류가 발생했습니다' },
      { status: 500 }
    );
  }
} 