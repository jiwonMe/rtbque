'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { useSocket } from '@/hooks/useSocket';
import { useRoomStore } from '@/store/useRoomStore';
import { SocketEvents, Video, SearchResult, Room, User } from 'shared';
import RoomHeader from '@/components/RoomHeader';
import VideoPlayer, { VideoPlayerHandle } from '@/components/VideoPlayer';
import VideoQueue from '@/components/VideoQueue';
import SearchPanel from '@/components/SearchPanel';
import UserList from '@/components/UserList';
import { v4 as uuidv4 } from 'uuid';

// 방 상태 업데이트를 위한 타입 정의
interface RoomStateUpdate {
  currentTime?: number;
  isPlaying?: boolean;
}

// SearchResult 타입 확장 (필요한 경우)
interface ExtendedSearchResult extends SearchResult {
  videoId?: string;
}

export default function RoomPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const roomId = params.id as string;
  const userName = searchParams.get('name') || '';
  
  const { 
    socket, 
    isConnected, 
    on, 
    off, 
    emit,
    serverTimeDiff,
    networkLatency,
    serverToClientTime,
    clientToServerTime
  } = useSocket();
  
  const { 
    room, 
    users, 
    setUserName, 
    updateRoomState, 
    updateCurrentTime, 
    updateIsPlaying,
    clearRoom,
    setRoom
  } = useRoomStore();
  
  const [isLoading, setIsLoading] = useState(true);
  const [isUserControlling, setIsUserControlling] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState(0);
  const hasJoinedRef = useRef(false);
  const isUserControllingRef = useRef(false);
  const roomIdRef = useRef(roomId);
  const userNameRef = useRef(userName);
  const lastJoinAttemptRef = useRef(0);
  const joinTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const videoPlayerRef = useRef<VideoPlayerHandle>(null);
  
  // roomId나 userName이 변경되면 ref 업데이트
  useEffect(() => {
    roomIdRef.current = roomId;
    userNameRef.current = userName;
  }, [roomId, userName]);
  
  // 방 참가 함수
  const joinRoom = useCallback(() => {
    if (!socket || !isConnected) return;
    
    // 마지막 참가 시도 후 5초가 지나지 않았으면 무시
    const now = Date.now();
    if (now - lastJoinAttemptRef.current < 5000) {
      console.log('최근에 방 참가를 시도했습니다. 중복 요청을 방지합니다.');
      return;
    }
    
    // 이미 방에 참가했으면 다시 참가 요청을 보내지 않음
    if (hasJoinedRef.current) {
      console.log('이미 방에 참가했습니다. 중복 요청을 방지합니다.');
      return;
    }
    
    console.log('방 참가 요청 전송:', roomIdRef.current, userNameRef.current);
    // 방 참가 요청
    emit(SocketEvents.JOIN_ROOM, { roomId: roomIdRef.current, userName: userNameRef.current });
    hasJoinedRef.current = true;
    lastJoinAttemptRef.current = now;
  }, [socket, isConnected, emit]);
  
  // 방 나가기 함수
  const leaveRoom = useCallback(() => {
    if (!socket || !isConnected || !hasJoinedRef.current) return;
    
    console.log('방 나가기 요청 전송:', roomIdRef.current);
    emit(SocketEvents.LEAVE_ROOM, { roomId: roomIdRef.current });
    hasJoinedRef.current = false;
    clearRoom();
  }, [socket, isConnected, emit, clearRoom]);
  
  // 시간 동기화 핸들러
  const handleSyncTime = useCallback((data: { currentTime: number; isPlaying: boolean; serverTime: number }) => {
    console.log('시간 동기화 응답:', data);
    
    // 사용자가 제어 중이면 동기화 무시
    if (isUserControllingRef.current) {
      console.log('사용자가 제어 중이므로 동기화 무시');
      return;
    }
    
    // 네트워크 지연을 고려한 서버 시간 계산
    const now = Date.now();
    const networkDelay = (now - data.serverTime) / 1000;
    
    // 네트워크 지연이 비정상적으로 큰 경우 제한 (1초 이상인 경우)
    const effectiveDelay = networkDelay > 1 ? 1 : networkDelay;
    
    // 조정된 시간 계산 (재생 중일 때만 네트워크 지연 적용)
    const adjustedTime = data.currentTime + (data.isPlaying ? effectiveDelay : 0);
    
    console.log('조정된 시간:', {
      original: data.currentTime,
      adjusted: adjustedTime,
      networkDelay: effectiveDelay,
      isPlaying: data.isPlaying
    });
    
    // 서버 시간을 항상 우선적으로 적용
    updateCurrentTime(adjustedTime);
    updateIsPlaying(data.isPlaying);
    setLastSyncTime(now);
    
    // 비디오 플레이어 참조가 있으면 시간 설정만 즉시 적용
    // (재생 상태는 VideoPlayer 컴포넌트에서 다이얼로그를 통해 처리)
    if (videoPlayerRef.current) {
      console.log('비디오 플레이어에 시간 설정:', {
        currentTime: adjustedTime
      });
      
      // 현재 시간 설정 (지연 없이 즉시 적용)
      videoPlayerRef.current.seekTo(adjustedTime);
    }
  }, [updateCurrentTime, updateIsPlaying]);
  
  // 방 참가 처리
  useEffect(() => {
    if (!isConnected || !socket) return;
    
    // 사용자 이름 설정
    setUserName(userNameRef.current);
    
    // 방 참가 요청 (지연 적용으로 중복 요청 방지)
    if (joinTimeoutRef.current) {
      clearTimeout(joinTimeoutRef.current);
    }
    
    joinTimeoutRef.current = setTimeout(() => {
      joinRoom();
    }, 500); // 0.5초로 단축 (성능 개선)
    
    // 방 상태 수신 핸들러
    const handleRoomState = (roomState: Room) => {
      console.log('방 상태 수신:', roomState);
      
      // 방 상태가 유효한지 확인
      if (roomState && roomState.id) {
        // 방 상태 업데이트 (Room 타입 직접 전달)
        updateRoomState(roomState);
        setIsLoading(false);
        
        // 현재 비디오 정보 로깅
        if (roomState.currentVideo) {
          console.log('현재 비디오 정보:', {
            id: roomState.currentVideo.id,
            title: roomState.currentVideo.title,
            youtubeId: roomState.currentVideo.youtubeId,
            duration: roomState.currentVideo.duration,
            isPlaying: roomState.isPlaying,
            currentTime: roomState.currentTime
          });
          
          // 비디오 플레이어 참조가 있으면 시간 설정만 즉시 적용
          // (재생 상태는 VideoPlayer 컴포넌트에서 다이얼로그를 통해 처리)
          if (videoPlayerRef.current) {
            console.log('비디오 플레이어에 시간 설정:', {
              currentTime: roomState.currentTime
            });
            
            // 현재 시간 설정 (지연 없이 즉시 적용)
            videoPlayerRef.current.seekTo(roomState.currentTime);
          }
        } else {
          console.log('현재 재생 중인 비디오가 없습니다.');
        }
        
        // 방에 처음 입장할 때 즉시 시간 동기화 요청 (최초 접속 시에만)
        console.log('최초 접속 시 시간 동기화 요청');
        emit(SocketEvents.SYNC_TIME);
        setLastSyncTime(Date.now());
        
        // 재생 상태 확인 및 로그 출력
        console.log('방 상태 업데이트 완료:', useRoomStore.getState().room);
        console.log('현재 재생 상태:', roomState.isPlaying ? '재생 중' : '일시정지');
        console.log('현재 시간:', roomState.currentTime);
        
        // 큐 정보 로깅
        console.log('현재 큐 정보:', roomState.queue);
      } else {
        console.error('유효하지 않은 방 상태 수신:', roomState);
      }
    };
    
    // 사용자 입장 핸들러
    const handleUserJoined = (user: User) => {
      console.log('사용자 입장:', user);
      // 현재 방 상태 가져오기
      const currentRoom = useRoomStore.getState().room;
      if (currentRoom) {
        // 사용자 목록 업데이트
        const updatedRoom = {
          ...currentRoom,
          users: [...currentRoom.users, user]
        };
        setRoom(updatedRoom);
      }
    };
    
    // 사용자 퇴장 핸들러
    const handleUserLeft = (userId: string) => {
      console.log('사용자 퇴장:', userId);
      // 현재 방 상태 가져오기
      const currentRoom = useRoomStore.getState().room;
      if (currentRoom) {
        // 사용자 목록 업데이트
        const updatedRoom = {
          ...currentRoom,
          users: currentRoom.users.filter(u => u.id !== userId)
        };
        setRoom(updatedRoom);
      }
    };
    
    // 방 상태 업데이트 핸들러
    const handleRoomStateUpdate = (update: RoomStateUpdate) => {
      console.log('방 상태 업데이트 수신:', update);
      
      // 사용자가 제어 중이면 동기화 무시
      if (isUserControllingRef.current) {
        console.log('사용자가 제어 중이므로 상태 업데이트 무시');
        return;
      }
      
      // 서버에서 받은 상태를 항상 우선적으로 적용
      // 재생 상태 업데이트
      if (update.isPlaying !== undefined) {
        console.log('재생 상태 업데이트:', update.isPlaying ? '재생' : '일시정지');
        updateIsPlaying(update.isPlaying);
      }
      
      // 현재 시간 업데이트
      if (update.currentTime !== undefined) {
        console.log('현재 시간 업데이트:', update.currentTime);
        updateCurrentTime(update.currentTime);
      }
      
      setLastSyncTime(Date.now());
      
      // 디버깅을 위해 다음 렌더링 사이클에서 상태 확인
      setTimeout(() => {
        const currentState = useRoomStore.getState();
        console.log('상태 업데이트 후 확인:', {
          isPlaying: currentState.room?.isPlaying,
          currentTime: currentState.room?.currentTime
        });
      }, 0);
    };
    
    // 큐 업데이트 핸들러
    const handleQueueUpdate = (queue: Video[]) => {
      console.log('큐 업데이트 수신:', queue);
      
      // 스토어에서 직접 최신 상태 가져오기
      const currentRoom = useRoomStore.getState().room;
      
      if (currentRoom) {
        console.log('현재 방 상태:', currentRoom);
        console.log('큐 업데이트 적용 전:', currentRoom.queue);
        
        // 방 상태 업데이트
        setRoom({
          ...currentRoom,
          queue: queue
        });
        
        // 디버깅을 위해 다음 렌더링 사이클에서 상태 확인
        setTimeout(() => {
          console.log('큐 업데이트 적용 후:', useRoomStore.getState().room?.queue);
        }, 0);
      } else {
        console.log('방 상태가 없습니다. 방 상태를 초기화합니다.');
        // 방 ID를 기반으로 최소한의 방 상태 생성
        const newRoom: Room = {
          id: roomIdRef.current,
          name: `Room ${roomIdRef.current}`,
          users: [],
          currentVideo: null,
          queue: queue,
          isPlaying: false,
          currentTime: 0,
          lastUpdateTime: Date.now()
        };
        setRoom(newRoom);
        
        // 디버깅을 위해 다음 렌더링 사이클에서 상태 확인
        setTimeout(() => {
          console.log('새 방 생성 후:', useRoomStore.getState().room);
        }, 0);
      }
    };
    
    // 이벤트 리스너 등록
    on(SocketEvents.ROOM_STATE, handleRoomState);
    on(SocketEvents.USER_JOINED, handleUserJoined);
    on(SocketEvents.USER_LEFT, handleUserLeft);
    on(SocketEvents.ROOM_STATE_UPDATE, handleRoomStateUpdate);
    on(SocketEvents.QUEUE_UPDATE, handleQueueUpdate);
    on(SocketEvents.SYNC_TIME, handleSyncTime);
    
    // 컴포넌트 언마운트 시 이벤트 리스너 제거 및 방 나가기
    return () => {
      console.log('컴포넌트 언마운트: 이벤트 리스너 제거 및 방 나가기');
      off(SocketEvents.ROOM_STATE);
      off(SocketEvents.USER_JOINED);
      off(SocketEvents.USER_LEFT);
      off(SocketEvents.ROOM_STATE_UPDATE);
      off(SocketEvents.QUEUE_UPDATE);
      off(SocketEvents.SYNC_TIME);
      
      // 타임아웃 정리
      if (joinTimeoutRef.current) {
        clearTimeout(joinTimeoutRef.current);
      }
      
      // 방 나가기 이벤트 명시적으로 발생
      leaveRoom();
    };
  }, [isConnected, socket, emit, on, off, updateRoomState, setRoom, clearRoom, handleSyncTime, setUserName, updateCurrentTime, updateIsPlaying, joinRoom, leaveRoom]);
  
  // 연결 상태 변경 감지 및 처리
  useEffect(() => {
    // 연결이 끊어졌다가 다시 연결되면 방 참가 상태 초기화
    if (!isConnected) {
      console.log('연결이 끊어졌습니다. 방 참가 상태 초기화');
      hasJoinedRef.current = false;
    } else if (isConnected && !hasJoinedRef.current) {
      // 연결되었고 아직 방에 참가하지 않았으면 참가 요청
      console.log('연결되었고 아직 방에 참가하지 않았습니다. 참가 요청 예약');
      
      // 이전 타임아웃 정리
      if (joinTimeoutRef.current) {
        clearTimeout(joinTimeoutRef.current);
      }
      
      // 지연 후 방 참가 요청 (중복 요청 방지)
      joinTimeoutRef.current = setTimeout(() => {
        joinRoom();
      }, 2000); // 2초 지연 후 방 참가 요청
    }
  }, [isConnected, joinRoom]);
  
  // 비디오 재생 함수
  const handlePlay = useCallback(() => {
    if (!socket || !isConnected) return;
    
    // 현재 클라이언트 시간 가져오기
    const playerRef = videoPlayerRef.current;
    const currentTime = playerRef?.getCurrentTime?.() || 0;
    
    console.log('재생 요청 전송:', currentTime);
    emit(SocketEvents.PLAY, { currentTime });
  }, [socket, isConnected, emit]);
  
  // 비디오 일시정지 함수
  const handlePause = useCallback(() => {
    if (!socket || !isConnected) return;
    
    // 현재 클라이언트 시간 가져오기
    const playerRef = videoPlayerRef.current;
    const currentTime = playerRef?.getCurrentTime?.() || 0;
    
    console.log('일시정지 요청 전송:', currentTime);
    emit(SocketEvents.PAUSE, { currentTime });
  }, [socket, isConnected, emit]);
  
  // 비디오 탐색 함수
  const handleSeek = useCallback((seconds: number) => {
    if (!socket || !isConnected) return;
    
    console.log('탐색 요청 전송:', seconds);
    emit(SocketEvents.SEEK, { currentTime: seconds });
  }, [socket, isConnected, emit]);
  
  // 비디오 종료 처리
  const handleVideoEnded = useCallback(() => {
    if (!socket || !isConnected) return;
    
    console.log('비디오 종료 이벤트 발생');
    emit(SocketEvents.VIDEO_ENDED);
    
    // 큐에 다음 비디오가 있는지 확인
    if (room?.queue && room.queue.length > 0) {
      console.log('큐에 다음 비디오가 있습니다. 서버에서 자동으로 처리합니다.');
    } else {
      console.log('큐에 다음 비디오가 없습니다. 재생이 중지됩니다.');
    }
  }, [socket, isConnected, emit, room?.queue]);
  
  // 시간 동기화 요청 함수
  const requestTimeSync = useCallback(() => {
    if (!socket || !isConnected) return;
    
    emit(SocketEvents.SYNC_TIME);
  }, [socket, isConnected, emit]);
  
  // 사용자 제어 시작 (재생, 일시정지, 탐색 등)
  const startUserControl = useCallback(() => {
    setIsUserControlling(true);
    isUserControllingRef.current = true;
  }, []);
  
  // 사용자 제어 종료
  const endUserControl = useCallback(() => {
    setIsUserControlling(false);
    isUserControllingRef.current = false;
    
    // 제어 종료 후 시간 동기화 요청
    requestTimeSync();
  }, [requestTimeSync]);
  
  // 큐에 비디오 추가 이벤트 핸들러
  const handleAddToQueue = useCallback((video: ExtendedSearchResult) => {
    if (!socket || !hasJoinedRef.current) {
      console.error('소켓 연결이 없거나 방에 참가하지 않아 비디오를 추가할 수 없습니다.');
      return;
    }
    
    console.log('큐에 비디오 추가 이벤트:', video);
    
    // videoId 또는 youtubeId 필드 확인
    const youtubeId = video.videoId || video.youtubeId;
    if (!youtubeId) {
      console.error('유효한 YouTube ID가 없습니다:', video);
      return;
    }
    
    // 비디오 객체 생성
    const newVideo: Video = {
      id: uuidv4(),
      title: video.title,
      thumbnail: video.thumbnail,
      duration: video.duration,
      youtubeId: youtubeId, // 확인된 youtubeId 사용
      addedBy: userNameRef.current
    };
    
    console.log('서버로 전송할 비디오 객체:', newVideo);
    socket.emit(SocketEvents.ADD_TO_QUEUE, newVideo);
  }, [socket]);
  
  // 큐에서 비디오 제거 이벤트 핸들러
  const handleRemoveFromQueue = useCallback((videoId: string) => {
    if (!socket || !hasJoinedRef.current) return;
    
    console.log('큐에서 비디오 제거 이벤트:', videoId);
    socket.emit(SocketEvents.REMOVE_FROM_QUEUE, { videoId });
  }, [socket]);
  
  // 비디오 건너뛰기 함수
  const handleSkip = useCallback(() => {
    if (!socket || !isConnected) return;
    
    console.log('비디오 건너뛰기 요청 전송');
    emit(SocketEvents.SKIP_CURRENT);
  }, [socket, isConnected, emit]);
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">방에 입장하는 중...</h2>
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500 mx-auto"></div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto p-4">
      <RoomHeader roomId={roomId} roomName={room?.name || `Room ${roomId}`} />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <VideoPlayer
            video={room?.currentVideo || null}
            isPlaying={room?.isPlaying || false}
            currentTime={room?.currentTime || 0}
            onPlay={handlePlay}
            onPause={handlePause}
            onSeek={handleSeek}
            onSkip={handleSkip}
            onEnded={handleVideoEnded}
            ref={videoPlayerRef}
          />
          
          <VideoQueue
            queue={room?.queue || []}
            currentVideo={room?.currentVideo || null}
            onRemove={handleRemoveFromQueue}
            onSkip={handleSkip}
          />
        </div>
        
        <div>
          <UserList users={room?.users || []} />
          <SearchPanel onAddToQueue={handleAddToQueue} />
        </div>
      </div>
    </div>
  );
} 