export interface Room {
    id: string;
    name: string;
    users: User[];
    currentVideo: Video | null;
    queue: Video[];
    isPlaying: boolean;
    currentTime: number;
    lastUpdateTime: number;
}
export interface Video {
    id: string;
    title: string;
    thumbnail: string;
    duration: number;
    youtubeId: string;
    addedBy: string;
}
export interface User {
    id: string;
    name: string;
    roomId: string | null;
}
export interface RoomState {
    room: Room;
    users: User[];
}
export interface SearchResult {
    id: string;
    title: string;
    thumbnail: string;
    duration: number;
    youtubeId: string;
}
