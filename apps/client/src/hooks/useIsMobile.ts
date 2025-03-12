import { useState, useEffect } from 'react';

/**
 * 현재 환경이 모바일인지 감지하는 훅
 * @returns 모바일 환경 여부
 */
export function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // 클라이언트 사이드에서만 실행
    if (typeof window === 'undefined') return;

    // 모바일 기기 감지 함수
    const checkMobile = () => {
      const userAgent = navigator.userAgent.toLowerCase();
      const mobileRegex = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i;
      
      // 모바일 기기이거나 화면 너비가 768px 이하인 경우
      return mobileRegex.test(userAgent) || window.innerWidth <= 768;
    };

    // 초기 상태 설정
    setIsMobile(checkMobile());

    // 화면 크기 변경 시 다시 체크
    const handleResize = () => {
      setIsMobile(checkMobile());
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return isMobile;
} 