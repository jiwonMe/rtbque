import { Room, RoomState, User } from 'shared';

// 메모리 내 데이터 저장소 (실제 프로덕션에서는 데이터베이스 사용 권장)
const rooms: Map<string, Room> = new Map();
const users: Map<string, User> = new Map();

/**
 * 방 상태를 가져옵니다.
 */
export function getRoomState(roomId: string): RoomState {
  let room = rooms.get(roomId);
  
  // 방이 존재하지 않으면 새로 생성
  if (!room) {
    room = {
      id: roomId,
      name: `Room ${roomId}`,
      currentVideo: null,
      queue: [],
      isPlaying: false,
      currentTime: 0,
      lastUpdated: Date.now()
    };
    rooms.set(roomId, room);
    console.log(`Created new room: ${roomId}`);
  }
  
  // 방에 있는 사용자 목록 가져오기
  const roomUsers = Array.from(users.values()).filter(user => user.roomId === roomId);
  
  return {
    room,
    users: roomUsers
  };
}

/**
 * 방 상태를 업데이트합니다.
 */
export function updateRoomState(room: Room): void {
  rooms.set(room.id, room);
}

/**
 * 새 방을 생성합니다.
 */
export function createRoom(roomName: string): Room {
  const roomId = generateRoomId();
  const room: Room = {
    id: roomId,
    name: roomName || `Room ${roomId}`,
    currentVideo: null,
    queue: [],
    isPlaying: false,
    currentTime: 0,
    lastUpdated: Date.now()
  };
  
  rooms.set(roomId, room);
  return room;
}

/**
 * 방을 삭제합니다.
 */
export function deleteRoom(roomId: string): boolean {
  return rooms.delete(roomId);
}

/**
 * 사용자를 가져옵니다.
 */
export function getUser(userId: string): User | undefined {
  return users.get(userId);
}

/**
 * 사용자를 추가합니다.
 */
export function addUser(user: User): void {
  users.set(user.id, user);
}

/**
 * 사용자를 삭제합니다.
 */
export function removeUser(userId: string): boolean {
  return users.delete(userId);
}

/**
 * 고유한 방 ID를 생성합니다.
 */
function generateRoomId(): string {
  // 6자리 영숫자 ID 생성
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
} 