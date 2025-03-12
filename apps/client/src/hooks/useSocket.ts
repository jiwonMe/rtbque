import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { SocketEvents } from 'shared';

// 소켓 서버 URL
const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

// 전역 소켓 인스턴스 (앱 전체에서 공유)
let globalSocket: Socket | null = null;
// 연결 시도 중인지 추적
let isConnecting = false;

// 서버와의 시간 차이 (클라이언트 시간 - 서버 시간)
let serverTimeDiff = 0;
// 네트워크 지연 시간 (ms)
let networkLatency = 0;

// 서버 시간 동기화 함수
export function syncWithServerTime(serverTime: number) {
  if (!serverTime) return;
  
  const clientTime = Date.now();
  const previousDiff = serverTimeDiff;
  serverTimeDiff = clientTime - serverTime;
  
  console.log('서버 시간 동기화:', {
    serverTime,
    clientTime,
    previousDiff,
    currentDiff: serverTimeDiff,
    diffChange: serverTimeDiff - previousDiff,
    latency: networkLatency
  });
}

// 네트워크 지연 시간 계산 함수
export function calculateNetworkLatency(requestTime: number, serverTime: number) {
  if (!requestTime || !serverTime) return;
  
  const responseTime = Date.now();
  // 왕복 시간의 절반을 네트워크 지연으로 간주
  networkLatency = (responseTime - requestTime) / 2;
  
  console.log('네트워크 지연 계산:', {
    requestTime,
    responseTime,
    roundTrip: responseTime - requestTime,
    latency: networkLatency
  });
}

// 서버 시간을 클라이언트 시간으로 변환
export function serverToClientTime(serverTime: number): number {
  return serverTime + serverTimeDiff + networkLatency;
}

// 클라이언트 시간을 서버 시간으로 변환
export function clientToServerTime(clientTime: number): number {
  return clientTime - serverTimeDiff - networkLatency;
}

export function useSocket() {
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const reconnectAttemptRef = useRef(0);
  const syncRequestTimeRef = useRef<number>(0);

  // 소켓 초기화
  useEffect(() => {
    // 이미 전역 소켓이 있고 연결되어 있으면 재사용
    if (globalSocket && globalSocket.connected) {
      socketRef.current = globalSocket;
      setIsConnected(true);
      console.log('기존 소켓 재사용 (연결됨):', globalSocket.id);
      return;
    }
    
    // 이미 연결 시도 중이면 중복 연결 방지
    if (isConnecting) {
      console.log('이미 소켓 연결 시도 중입니다.');
      return;
    }
    
    isConnecting = true;
    console.log('새 소켓 연결 시도:', SOCKET_URL);
    
    // 소켓 연결
    const socket = io(SOCKET_URL, {
      reconnectionAttempts: 5, // 재연결 시도 횟수 감소
      reconnectionDelay: 2000, // 재연결 지연 시간 증가
      timeout: 10000,
      autoConnect: true,
      withCredentials: true,
      forceNew: false, // 기존 연결 재사용
    });

    // 연결 이벤트 핸들러
    socket.on(SocketEvents.CONNECT, () => {
      console.log('Socket connected:', socket.id);
      setIsConnected(true);
      isConnecting = false;
      reconnectAttemptRef.current = 0;
    });

    // 연결 해제 이벤트 핸들러
    socket.on(SocketEvents.DISCONNECT, (reason) => {
      console.log('Socket disconnected:', reason);
      setIsConnected(false);
      
      // 서버 측에서 강제로 연결을 끊은 경우 자동 재연결 비활성화
      if (reason === 'io server disconnect') {
        console.log('서버에서 연결을 끊었습니다. 자동 재연결하지 않습니다.');
        socket.disconnect();
      }
    });
    
    // 연결 오류 핸들러
    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      setIsConnected(false);
      isConnecting = false;
    });
    
    // 재연결 시도 핸들러
    socket.on('reconnect_attempt', (attemptNumber) => {
      console.log(`Socket reconnection attempt ${attemptNumber}`);
      reconnectAttemptRef.current = attemptNumber;
      
      // 재연결 시도가 너무 많으면 중단
      if (attemptNumber > 5) {
        console.log('재연결 시도가 너무 많습니다. 연결을 중단합니다.');
        socket.disconnect();
        isConnecting = false;
      }
    });
    
    // 재연결 성공 핸들러
    socket.on('reconnect', (attemptNumber) => {
      console.log(`Socket reconnected after ${attemptNumber} attempts`);
      setIsConnected(true);
      isConnecting = false;
      reconnectAttemptRef.current = 0;
    });
    
    // 재연결 실패 핸들러
    socket.on('reconnect_failed', () => {
      console.log('Socket reconnection failed');
      setIsConnected(false);
      isConnecting = false;
    });
    
    // 시간 동기화 응답 핸들러
    socket.on(SocketEvents.SYNC_TIME, (data: { currentTime: number; isPlaying: boolean; serverTime: number }) => {
      // 네트워크 지연 계산
      calculateNetworkLatency(syncRequestTimeRef.current, data.serverTime);
      // 서버 시간 동기화
      syncWithServerTime(data.serverTime);
    });

    // 소켓 저장
    socketRef.current = socket;
    globalSocket = socket;

    // 컴포넌트 언마운트 시 이벤트 리스너만 제거 (연결은 유지)
    return () => {
      if (socket) {
        // 모든 이벤트 리스너 제거 (연결 이벤트 제외)
        socket.removeAllListeners();
        socket.on(SocketEvents.CONNECT, () => {
          console.log('Socket connected:', socket.id);
          setIsConnected(true);
        });
        socket.on(SocketEvents.DISCONNECT, (reason) => {
          console.log('Socket disconnected:', reason);
          setIsConnected(false);
        });
      }
    };
  }, []);

  // 이벤트 리스너 등록
  const on = useCallback((event: string, callback: (...args: any[]) => void) => {
    if (socketRef.current) {
      // 기존 리스너 제거 후 새로 등록 (중복 방지)
      socketRef.current.off(event);
      socketRef.current.on(event, callback);
    }
  }, []);

  // 이벤트 리스너 제거
  const off = useCallback((event: string) => {
    if (socketRef.current) {
      socketRef.current.off(event);
    }
  }, []);

  // 이벤트 발생
  const emit = useCallback((event: string, ...args: any[]) => {
    if (socketRef.current && socketRef.current.connected) {
      // 시간 동기화 요청인 경우 요청 시간 기록
      if (event === SocketEvents.SYNC_TIME) {
        syncRequestTimeRef.current = Date.now();
        console.log('시간 동기화 요청 전송:', {
          requestTime: syncRequestTimeRef.current,
          currentServerTimeDiff: serverTimeDiff,
          currentLatency: networkLatency
        });
      }
      
      socketRef.current.emit(event, ...args);
    } else {
      console.warn('Socket not connected, cannot emit:', event);
    }
  }, []);

  return {
    socket: socketRef.current,
    isConnected,
    on,
    off,
    emit,
    serverTimeDiff,
    networkLatency,
    serverToClientTime,
    clientToServerTime
  };
} 