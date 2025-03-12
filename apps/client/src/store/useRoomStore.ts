import { create } from 'zustand';
import { Room, RoomState, User, Video } from 'shared';

interface RoomStore {
  // 상태
  room: Room | null;
  users: User[];
  userName: string;
  isConnected: boolean;
  
  // 액션
  setRoom: (room: Room) => void;
  setUsers: (users: User[]) => void;
  setUserName: (name: string) => void;
  setIsConnected: (isConnected: boolean) => void;
  updateRoomState: (roomState: Room | RoomState) => void;
  updateCurrentTime: (time: number) => void;
  updateIsPlaying: (isPlaying: boolean) => void;
  addToQueue: (video: Video) => void;
  removeFromQueue: (videoId: string) => void;
  setCurrentVideo: (video: Video | null) => void;
  clearRoom: () => void;
}

export const useRoomStore = create<RoomStore>((set) => ({
  // 초기 상태
  room: null,
  users: [],
  userName: '',
  isConnected: false,
  
  // 액션
  setRoom: (room) => set({ room }),
  setUsers: (users) => set({ users }),
  setUserName: (userName) => set({ userName }),
  setIsConnected: (isConnected) => set({ isConnected }),
  
  updateRoomState: (roomState) => {
    console.log('updateRoomState 호출됨:', roomState);
    if (!roomState) {
      console.error('유효하지 않은 방 상태:', roomState);
      return;
    }
    
    // Room 타입과 RoomState 타입 모두 처리
    const room = 'room' in roomState ? roomState.room : roomState;
    const users = 'users' in roomState ? roomState.users : (room.users || []);
    
    // 현재 비디오 정보 로깅
    if (room.currentVideo) {
      console.log('스토어 업데이트 - 현재 비디오:', {
        id: room.currentVideo.id,
        title: room.currentVideo.title,
        youtubeId: room.currentVideo.youtubeId
      });
    } else {
      console.log('스토어 업데이트 - 현재 재생 중인 비디오가 없음');
    }
    
    // 큐 정보 로깅
    console.log('스토어 업데이트 - 큐 정보:', room.queue);
    
    set({
      room,
      users
    });
    console.log('방 상태 업데이트 완료');
  },
  
  updateCurrentTime: (time) => set((state) => ({
    room: state.room ? {
      ...state.room,
      currentTime: time,
      lastUpdated: Date.now()
    } : null
  })),
  
  updateIsPlaying: (isPlaying) => set((state) => ({
    room: state.room ? {
      ...state.room,
      isPlaying,
      lastUpdated: Date.now()
    } : null
  })),
  
  addToQueue: (video) => set((state) => ({
    room: state.room ? {
      ...state.room,
      queue: [...state.room.queue, video]
    } : null
  })),
  
  removeFromQueue: (videoId) => set((state) => ({
    room: state.room ? {
      ...state.room,
      queue: state.room.queue.filter(v => v.id !== videoId)
    } : null
  })),
  
  setCurrentVideo: (video) => set((state) => ({
    room: state.room ? {
      ...state.room,
      currentVideo: video,
      currentTime: 0,
      lastUpdated: Date.now()
    } : null
  })),
  
  clearRoom: () => set({
    room: null,
    users: []
  })
})); 