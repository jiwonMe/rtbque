import { Server, Socket } from 'socket.io';
import { v4 as uuidv4 } from 'uuid';
import { SocketEvents, Room, User, Video } from 'shared';

// 상태 관리를 위한 맵 객체들
const rooms = new Map<string, Room>();
const users = new Map<string, User>();
const socketToRoom = new Map<string, string>();
const socketStatus = new Map<string, 'connected' | 'disconnecting'>();
const lastUserActions = new Map<string, { action: string; timestamp: number }>();

// 사용자 ID로 사용자 이름 가져오기
const getUserName = (userId: string): string => {
  const user = users.get(userId);
  if (user) return user.name;
  
  // 맵에서 찾지 못한 경우 방에서 검색
  for (const [roomId, room] of rooms.entries()) {
    const user = room.users.find(u => u.id === userId);
    if (user) {
      return user.name;
    }
  }
  return 'Unknown User';
};

// 사용자 액션 기록 (중복 요청 방지용)
const recordUserAction = (userId: string, action: string): boolean => {
  const now = Date.now();
  const lastAction = lastUserActions.get(userId);
  
  // 액션별 중복 요청 방지 시간 설정 (밀리초)
  let preventDuplicateTime = 1000; // 기본 1초
  
  // 비디오 종료 및 스킵 이벤트는 더 긴 시간 동안 중복 요청 방지
  if (action === SocketEvents.VIDEO_ENDED || action === SocketEvents.SKIP_CURRENT) {
    preventDuplicateTime = 3000; // 3초
  }
  
  // 같은 액션이 설정된 시간 이내에 중복 요청되면 무시
  if (lastAction && lastAction.action === action && now - lastAction.timestamp < preventDuplicateTime) {
    console.log(`사용자 ${userId}의 ${action} 중복 요청 무시 (${now - lastAction.timestamp}ms 이내)`);
    return false;
  }
  
  lastUserActions.set(userId, { action, timestamp: now });
  return true;
};

export function setupSocketIO(io: Server) {
  io.on('connection', (socket: Socket) => {
    console.log(`User connected: ${socket.id}`);
    socketStatus.set(socket.id, 'connected');

    // 방 참가 이벤트 처리
    socket.on(SocketEvents.JOIN_ROOM, ({ roomId, userName }) => {
      // 연결 상태 확인
      if (socketStatus.get(socket.id) !== 'connected') {
        console.log(`Socket ${socket.id}가 연결 해제 중이므로 참가 요청을 무시합니다`);
        return;
      }
      
      // 이미 방에 참가한 사용자인지 확인
      const existingRoomId = socketToRoom.get(socket.id);
      if (existingRoomId === roomId) {
        console.log(`사용자 ${socket.id}는 이미 방 ${roomId}에 있습니다`);
        
        // 이미 방에 있는 경우 현재 방 상태만 전송
        const room = rooms.get(roomId);
        if (room) {
          // 현재 시간 계산 (재생 중인 경우 경과 시간 반영)
          let currentServerTime = room.currentTime;
          if (room.isPlaying) {
            const now = Date.now();
            const elapsedSeconds = (now - room.lastUpdateTime) / 1000;
            currentServerTime += elapsedSeconds;
            
            // 비디오 길이를 초과하지 않도록 조정
            if (room.currentVideo && room.currentVideo.duration) {
              currentServerTime = Math.min(currentServerTime, room.currentVideo.duration);
            }
          }
          
          // 계산된 현재 시간으로 방 상태 업데이트
          const updatedRoom = {
            ...room,
            currentTime: currentServerTime
          };
          
          socket.emit(SocketEvents.ROOM_STATE, updatedRoom);
          console.log(`사용자 ${userName || socket.id}에게 업데이트된 방 상태 전송:`, {
            currentVideo: room.currentVideo?.title,
            isPlaying: room.isPlaying,
            currentTime: currentServerTime
          });
        }
        return;
      }
      
      // 다른 방에 있었다면 먼저 나가기
      if (existingRoomId) {
        handleUserLeaveRoom(socket, false);
      }
      
      // 방이 존재하지 않으면 생성
      if (!rooms.has(roomId)) {
        rooms.set(roomId, {
          id: roomId,
          name: `Room ${roomId}`,
          users: [],
          currentVideo: null,
          queue: [],
          isPlaying: false,
          currentTime: 0,
          lastUpdateTime: Date.now(),
        });
      }

      const room = rooms.get(roomId)!;
      
      // 사용자 생성
      const user: User = {
        id: socket.id,
        name: userName || `User ${socket.id.substring(0, 5)}`,
        roomId,
      };
      
      // 사용자 정보 저장
      users.set(socket.id, user);
      socketToRoom.set(socket.id, roomId);
      
      // 방에 사용자 추가 (중복 방지)
      if (!room.users.some(u => u.id === socket.id)) {
        room.users.push(user);
      }
      
      // 방 참가
      socket.join(roomId);
      
      // 현재 시간 계산 (재생 중인 경우 경과 시간 반영)
      let currentServerTime = room.currentTime;
      if (room.isPlaying) {
        const now = Date.now();
        const elapsedSeconds = (now - room.lastUpdateTime) / 1000;
        currentServerTime += elapsedSeconds;
        
        // 비디오 길이를 초과하지 않도록 조정
        if (room.currentVideo && room.currentVideo.duration) {
          currentServerTime = Math.min(currentServerTime, room.currentVideo.duration);
        }
      }
      
      // 계산된 현재 시간으로 방 상태 업데이트
      const updatedRoom = {
        ...room,
        currentTime: currentServerTime
      };
      
      // 방 상태 전송
      socket.emit(SocketEvents.ROOM_STATE, updatedRoom);
      
      // 다른 사용자들에게 사용자 참가 알림
      socket.to(roomId).emit(SocketEvents.USER_JOINED, user);
      
      console.log(`사용자 ${user.name}가 방 ${roomId}에 참가했습니다`, {
        currentVideo: room.currentVideo?.title,
        isPlaying: room.isPlaying,
        currentTime: currentServerTime
      });
    });

    // 방 나가기 이벤트 처리
    socket.on(SocketEvents.LEAVE_ROOM, () => {
      handleUserLeaveRoom(socket, true);
    });

    // 비디오 재생 이벤트 처리
    socket.on(SocketEvents.PLAY, ({ currentTime }) => {
      const roomId = socketToRoom.get(socket.id);
      if (!roomId || !rooms.has(roomId)) return;
      
      // 중복 요청 방지
      if (!recordUserAction(socket.id, SocketEvents.PLAY)) {
        console.log(`[${roomId}] 중복된 재생 요청 무시`);
        return;
      }
      
      const room = rooms.get(roomId)!;
      
      // 이미 재생 중인지 확인
      if (room.isPlaying) {
        console.log(`[${roomId}] 이미 재생 중입니다`);
        return;
      }
      
      // 클라이언트에서 보낸 현재 시간 사용 (선택적)
      let serverTime = room.currentTime;
      if (typeof currentTime === 'number' && currentTime >= 0) {
        serverTime = currentTime;
      }
      
      // 방 상태 업데이트
      const updates = {
        isPlaying: true,
        currentTime: serverTime,
        lastUpdateTime: Date.now()
      };
      
      // 방 상태 직접 업데이트
      Object.assign(room, updates);
      
      // 모든 클라이언트에게 상태 변경 알림 (요청한 클라이언트 포함)
      io.to(roomId).emit(SocketEvents.ROOM_STATE_UPDATE, updates);

      console.log(`[${roomId}] 재생 이벤트 처리:`, {
        userId: socket.id,
        userName: getUserName(socket.id),
        currentTime: serverTime,
        isPlaying: true
      });
    });

    // 비디오 일시정지 이벤트 처리
    socket.on(SocketEvents.PAUSE, ({ currentTime }) => {
      const roomId = socketToRoom.get(socket.id);
      if (!roomId || !rooms.has(roomId)) return;
      
      // 중복 요청 방지
      if (!recordUserAction(socket.id, SocketEvents.PAUSE)) {
        console.log(`[${roomId}] 중복된 일시정지 요청 무시`);
        return;
      }
      
      const room = rooms.get(roomId)!;
      
      // 이미 일시정지 상태인지 확인
      if (!room.isPlaying) {
        console.log(`[${roomId}] 이미 일시정지 상태입니다`);
        return;
      }
      
      // 클라이언트에서 보낸 현재 시간 사용 (선택적)
      let serverTime = room.currentTime;
      if (typeof currentTime === 'number' && currentTime >= 0) {
        serverTime = currentTime;
      } else {
        // 재생 중이었다면 경과 시간 계산
        const now = Date.now();
        const elapsedSeconds = (now - room.lastUpdateTime) / 1000;
        serverTime += elapsedSeconds;
      }

      // 방 상태 업데이트
      const updates = {
        isPlaying: false,
        currentTime: serverTime,
        lastUpdateTime: Date.now()
      };
      
      // 방 상태 직접 업데이트
      Object.assign(room, updates);
      
      // 모든 클라이언트에게 상태 변경 알림 (요청한 클라이언트 포함)
      io.to(roomId).emit(SocketEvents.ROOM_STATE_UPDATE, updates);

      console.log(`[${roomId}] 일시정지 이벤트 처리:`, {
        userId: socket.id,
        userName: getUserName(socket.id),
        currentTime: serverTime,
        isPlaying: false
      });
    });

    // 비디오 탐색 이벤트 처리
    socket.on(SocketEvents.SEEK, ({ currentTime }) => {
      const roomId = socketToRoom.get(socket.id);
      if (!roomId || !rooms.has(roomId)) return;
      
      // 중복 요청 방지 (탐색은 빠르게 여러 번 발생할 수 있으므로 예외적으로 허용)
      const room = rooms.get(roomId)!;
      
      // 유효한 시간 값인지 확인
      if (typeof currentTime !== 'number' || currentTime < 0) {
        console.log(`[${roomId}] 유효하지 않은 탐색 시간: ${currentTime}`);
        return;
      }
      
      // 방 상태 업데이트
      const updates = {
        currentTime: currentTime,
        lastUpdateTime: Date.now()
      };
      
      // 방 상태 직접 업데이트
      Object.assign(room, updates);
      
      // 모든 클라이언트에게 상태 변경 알림 (요청한 클라이언트 포함)
      io.to(roomId).emit(SocketEvents.ROOM_STATE_UPDATE, updates);

      console.log(`[${roomId}] 탐색 이벤트 처리:`, {
        userId: socket.id,
        userName: getUserName(socket.id),
        currentTime: currentTime,
        isPlaying: room.isPlaying
      });
    });

    // 큐에 비디오 추가 이벤트 처리
    socket.on(SocketEvents.ADD_TO_QUEUE, (video: Video) => {
      const roomId = socketToRoom.get(socket.id);
      if (!roomId || !rooms.has(roomId)) {
        console.log(`[${socket.id}] 방을 찾을 수 없어 비디오 추가 실패`);
        return;
      }
      
      const room = rooms.get(roomId)!;
      
      // 비디오 객체 유효성 검사
      if (!video || !video.youtubeId) {
        console.error(`[${roomId}] 유효하지 않은 비디오 객체:`, video);
        return;
      }
      
      // 비디오 ID 확인 및 생성
      if (!video.id) {
        video.id = uuidv4();
      }
      
      // 추가한 사용자 정보 설정
      if (!video.addedBy) {
        video.addedBy = getUserName(socket.id);
      }
      
      console.log(`[${roomId}] 큐에 비디오 추가 요청:`, video);
      
      // 현재 재생 중인 비디오가 없으면 바로 재생
      if (!room.currentVideo) {
        console.log(`[${roomId}] 현재 재생 중인 비디오가 없어 바로 재생:`, video);
        room.currentVideo = video;
        room.currentTime = 0;
        room.isPlaying = true;
        room.lastUpdateTime = Date.now();
        
        // 모든 사용자에게 방 상태 업데이트 전파
        io.to(roomId).emit(SocketEvents.ROOM_STATE, room);
        console.log(`[${roomId}] 방 상태 업데이트 전송 (현재 비디오 설정)`, {
          currentVideo: room.currentVideo,
          isPlaying: room.isPlaying,
          currentTime: room.currentTime
        });
      } else {
        // 큐에 추가
        room.queue.push(video);
        console.log(`[${roomId}] 큐에 비디오 추가됨, 현재 큐 길이: ${room.queue.length}`);
        
        // 모든 사용자에게 큐 업데이트 전파
        io.to(roomId).emit(SocketEvents.QUEUE_UPDATE, room.queue);
      }
    });

    // 큐에서 비디오 제거 이벤트 처리
    socket.on(SocketEvents.REMOVE_FROM_QUEUE, ({ videoId }) => {
      const roomId = socketToRoom.get(socket.id);
      if (!roomId || !rooms.has(roomId)) return;
      
      const room = rooms.get(roomId)!;
      
      // 큐에서 비디오 제거
      const initialLength = room.queue.length;
      room.queue = room.queue.filter(video => video.id !== videoId);
      
      // 변경이 있을 때만 업데이트 전송
      if (initialLength !== room.queue.length) {
        // 모든 사용자에게 큐 업데이트 전파
        io.to(roomId).emit(SocketEvents.QUEUE_UPDATE, room.queue);
        console.log(`[${roomId}] 큐에서 비디오 제거됨, 현재 큐 길이: ${room.queue.length}`);
      }
    });

    // 현재 비디오 건너뛰기 이벤트 처리
    socket.on(SocketEvents.SKIP_CURRENT, () => {
      const roomId = socketToRoom.get(socket.id);
      if (!roomId || !rooms.has(roomId)) return;
      
      // 중복 요청 방지
      if (!recordUserAction(socket.id, SocketEvents.SKIP_CURRENT)) {
        console.log(`[${roomId}] 중복된 건너뛰기 요청 무시`);
        return;
      }
      
      const room = rooms.get(roomId)!;
      console.log(`[${roomId}] 현재 비디오 건너뛰기 요청`);
      
      // 큐에 비디오가 있으면 다음 비디오 재생
      if (room.queue.length > 0) {
        const nextVideo = room.queue.shift()!;
        console.log(`[${roomId}] 다음 비디오로 넘어가기:`, nextVideo.title);
        room.currentVideo = nextVideo;
        room.currentTime = 0;
        room.isPlaying = true;
        room.lastUpdateTime = Date.now();
        
        // 모든 사용자에게 방 상태 업데이트 전파
        io.to(roomId).emit(SocketEvents.ROOM_STATE, room);
        console.log(`[${roomId}] 방 상태 업데이트 전송 (다음 비디오 설정)`, {
          currentVideo: room.currentVideo,
          isPlaying: room.isPlaying,
          currentTime: room.currentTime
        });
      } else {
        // 큐에 비디오가 없으면 현재 비디오만 제거
        console.log(`[${roomId}] 큐에 비디오가 없어 현재 비디오만 제거`);
        room.currentVideo = null;
        room.currentTime = 0;
        room.isPlaying = false;
        room.lastUpdateTime = Date.now();
        
        // 모든 사용자에게 방 상태 업데이트 전파
        io.to(roomId).emit(SocketEvents.ROOM_STATE, room);
        console.log(`[${roomId}] 방 상태 업데이트 전송 (비디오 제거)`);
      }
    });

    // 비디오 종료 이벤트 처리
    socket.on(SocketEvents.VIDEO_ENDED, () => {
      const roomId = socketToRoom.get(socket.id);
      if (!roomId || !rooms.has(roomId)) return;
      
      // 중복 요청 방지
      if (!recordUserAction(socket.id, SocketEvents.VIDEO_ENDED)) {
        console.log(`[${roomId}] 중복된 비디오 종료 요청 무시`);
        return;
      }
      
      console.log(`[${roomId}] 비디오 종료 이벤트 수신 (사용자: ${getUserName(socket.id)})`);
      handleVideoEnded(roomId);
    });

    // 시간 동기화 요청 처리
    socket.on(SocketEvents.SYNC_TIME, () => {
      const roomId = socketToRoom.get(socket.id);
      if (!roomId || !rooms.has(roomId)) {
        // 방에 없는 경우 빈 응답 전송
        socket.emit(SocketEvents.SYNC_TIME, {
          currentTime: 0,
          isPlaying: false,
          serverTime: Date.now()
        });
        return;
      }
      
      const room = rooms.get(roomId)!;
      
      // 현재 서버 시간 계산
      let currentServerTime = room.currentTime;
      
      // 재생 중인 경우 경과 시간 계산
      if (room.isPlaying) {
        const now = Date.now();
        const elapsedSeconds = (now - room.lastUpdateTime) / 1000;
        currentServerTime += elapsedSeconds;
        
        // 비디오 길이를 초과하지 않도록 조정 (필요한 경우)
        if (room.currentVideo && room.currentVideo.duration) {
          currentServerTime = Math.min(currentServerTime, room.currentVideo.duration);
          
          // 비디오가 끝났는지 확인
          if (currentServerTime >= room.currentVideo.duration - 0.5) {
            // 자동으로 다음 비디오로 넘어가기
            handleVideoEnded(roomId);
            return;
          }
        }
      }
      
      // 클라이언트에게 현재 시간 및 재생 상태 전송
      socket.emit(SocketEvents.SYNC_TIME, {
        currentTime: currentServerTime,
        isPlaying: room.isPlaying,
        serverTime: Date.now()
      });
      
      console.log(`[${roomId}] 시간 동기화 응답 전송:`, {
        userId: socket.id,
        userName: getUserName(socket.id),
        currentTime: currentServerTime,
        isPlaying: room.isPlaying
      });
    });

    // 연결 해제 이벤트 처리
    socket.on('disconnect', () => {
      socketStatus.set(socket.id, 'disconnecting');
      handleUserLeaveRoom(socket, true);
      
      // 사용자 관련 데이터 정리
      lastUserActions.delete(socket.id);
      socketStatus.delete(socket.id);
      
      console.log(`사용자 연결 해제: ${socket.id}`);
    });
  });

  // 사용자 방 나가기 처리 함수
  function handleUserLeaveRoom(socket: Socket, notifyOthers: boolean = true) {
    const roomId = socketToRoom.get(socket.id);
    if (!roomId || !rooms.has(roomId)) return;
    
    const room = rooms.get(roomId)!;
    const user = users.get(socket.id);
    
    // 방에서 사용자 제거
    room.users = room.users.filter(u => u.id !== socket.id);
    
    // 사용자 정보 제거
    users.delete(socket.id);
    socketToRoom.delete(socket.id);
    
    // 방에 사용자가 없으면 방 제거
    if (room.users.length === 0) {
      rooms.delete(roomId);
      console.log(`방 ${roomId} 삭제됨 (사용자 없음)`);
    } else if (notifyOthers) {
      // 다른 사용자들에게 사용자 퇴장 알림 (요청된 경우에만)
      socket.to(roomId).emit(SocketEvents.USER_LEFT, socket.id);
    }
    
    if (notifyOthers && user) {
      console.log(`사용자 ${user.name}가 방 ${roomId}에서 나갔습니다`);
    }
    
    // 방에서 나가기
    socket.leave(roomId);
  }

  // 비디오 종료 처리 함수
  function handleVideoEnded(roomId: string) {
    if (!rooms.has(roomId)) return;
    
    const room = rooms.get(roomId)!;
    console.log(`[${roomId}] 비디오 종료 처리 시작`);
    
    // 큐에 비디오가 있으면 다음 비디오 재생
    if (room.queue.length > 0) {
      const nextVideo = room.queue.shift()!;
      console.log(`[${roomId}] 비디오 종료 - 다음 비디오로 자동 전환:`, nextVideo.title);
      room.currentVideo = nextVideo;
      room.currentTime = 0;
      room.isPlaying = true;
      room.lastUpdateTime = Date.now();
      
      // 모든 사용자에게 방 상태 업데이트 전파
      io.to(roomId).emit(SocketEvents.ROOM_STATE, room);
      console.log(`[${roomId}] 방 상태 업데이트 전송 (다음 비디오 설정)`, {
        currentVideo: room.currentVideo.title,
        isPlaying: room.isPlaying,
        currentTime: room.currentTime
      });
    } else {
      // 큐에 비디오가 없으면 현재 비디오만 제거
      console.log(`[${roomId}] 비디오 종료 - 큐에 비디오가 없어 재생 중지`);
      room.currentVideo = null;
      room.currentTime = 0;
      room.isPlaying = false;
      room.lastUpdateTime = Date.now();
      
      // 모든 사용자에게 방 상태 업데이트 전파
      io.to(roomId).emit(SocketEvents.ROOM_STATE, room);
      console.log(`[${roomId}] 방 상태 업데이트 전송 (비디오 제거)`);
    }
  }
} 