export enum SocketEvents {
  // 연결 이벤트
  CONNECT = 'connect',
  DISCONNECT = 'disconnect',
  
  // 사용자 이벤트
  JOIN_ROOM = 'join_room',
  LEAVE_ROOM = 'leave_room',
  USER_JOINED = 'user_joined',
  USER_LEFT = 'user_left',
  
  // 방 상태 이벤트
  ROOM_STATE = 'room_state',
  ROOM_STATE_UPDATE = 'room_state_update',
  
  // 비디오 제어 이벤트
  PLAY = 'play',
  PAUSE = 'pause',
  SEEK = 'seek',
  SYNC_TIME = 'sync_time',
  VIDEO_ENDED = 'video_ended',
  
  // 큐 관리 이벤트
  ADD_TO_QUEUE = 'add_to_queue',
  REMOVE_FROM_QUEUE = 'remove_from_queue',
  SKIP_CURRENT = 'skip_current',
  QUEUE_UPDATE = 'queue_update',
  
  // 검색 이벤트
  SEARCH_VIDEOS = 'search_videos',
  SEARCH_RESULTS = 'search_results',
  
  // 에러 이벤트
  ERROR = 'error'
} 