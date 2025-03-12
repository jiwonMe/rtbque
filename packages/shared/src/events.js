"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SocketEvents = void 0;
var SocketEvents;
(function (SocketEvents) {
    // 연결 이벤트
    SocketEvents["CONNECT"] = "connect";
    SocketEvents["DISCONNECT"] = "disconnect";
    // 사용자 이벤트
    SocketEvents["JOIN_ROOM"] = "join_room";
    SocketEvents["LEAVE_ROOM"] = "leave_room";
    SocketEvents["USER_JOINED"] = "user_joined";
    SocketEvents["USER_LEFT"] = "user_left";
    // 방 상태 이벤트
    SocketEvents["ROOM_STATE"] = "room_state";
    SocketEvents["ROOM_STATE_UPDATE"] = "room_state_update";
    // 비디오 제어 이벤트
    SocketEvents["PLAY"] = "play";
    SocketEvents["PAUSE"] = "pause";
    SocketEvents["SEEK"] = "seek";
    SocketEvents["SYNC_TIME"] = "sync_time";
    SocketEvents["VIDEO_ENDED"] = "video_ended";
    // 큐 관리 이벤트
    SocketEvents["ADD_TO_QUEUE"] = "add_to_queue";
    SocketEvents["REMOVE_FROM_QUEUE"] = "remove_from_queue";
    SocketEvents["SKIP_CURRENT"] = "skip_current";
    SocketEvents["QUEUE_UPDATE"] = "queue_update";
    // 검색 이벤트
    SocketEvents["SEARCH_VIDEOS"] = "search_videos";
    SocketEvents["SEARCH_RESULTS"] = "search_results";
    // 에러 이벤트
    SocketEvents["ERROR"] = "error";
})(SocketEvents || (exports.SocketEvents = SocketEvents = {}));
