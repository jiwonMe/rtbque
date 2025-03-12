'use client';

import { useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react';
import YouTube, { YouTubePlayer, YouTubeEvent } from 'react-youtube';
import { Video } from 'shared';
import { formatTime } from '@/lib/utils';

interface VideoPlayerProps {
  video: Video | null;
  isPlaying: boolean;
  currentTime: number;
  onPlay: () => void;
  onPause: () => void;
  onSeek: (currentTime: number) => void;
  onSkip: () => void;
  onEnded?: () => void;
}

// 외부에서 접근할 수 있는 메서드 정의
export interface VideoPlayerHandle {
  getCurrentTime: () => number;
  seekTo: (seconds: number) => void;
  playVideo: () => void;
  pauseVideo: () => void;
}

const VideoPlayer = forwardRef<VideoPlayerHandle, VideoPlayerProps>(({
  video,
  isPlaying,
  currentTime,
  onPlay,
  onPause,
  onSeek,
  onSkip,
  onEnded
}, ref) => {
  const playerRef = useRef<YouTubePlayer | null>(null);
  const [playerState, setPlayerState] = useState<number>(-1);
  const [localCurrentTime, setLocalCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [isSeeking, setIsSeeking] = useState<boolean>(false);
  const [seekValue, setSeekValue] = useState<number>(0);
  const lastSyncTimeRef = useRef<number>(Date.now());
  const isUserControlledRef = useRef<boolean>(false);
  const [playerError, setPlayerError] = useState<boolean>(false);
  const initialSyncDoneRef = useRef<boolean>(false);
  
  // 사용자 조작 여부를 추적하는 상태 변수 추가
  const hasUserInteractedRef = useRef<boolean>(false);
  
  // 비디오 종료 시 중복 호출 방지를 위한 변수 추가
  const isSkippingRef = useRef<boolean>(false);
  const skipTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const videoEndedRef = useRef<boolean>(false); // 비디오 종료 상태 추적
  
  // 따라서 재생 다이얼로그 상태
  const [showSyncDialog, setShowSyncDialog] = useState<boolean>(false);
  const [syncDialogTime, setSyncDialogTime] = useState<number>(0);
  const syncDialogTimeRef = useRef<number>(0);
  const syncStartTimeRef = useRef<number>(Date.now());
  
  // 외부에서 접근할 수 있는 메서드 노출
  useImperativeHandle(ref, () => ({
    getCurrentTime: () => {
      try {
        return playerRef.current?.getCurrentTime() || localCurrentTime;
      } catch (error) {
        console.error('getCurrentTime 오류:', error);
        return localCurrentTime;
      }
    },
    seekTo: (seconds: number) => {
      try {
        if (playerRef.current) {
          console.log(`seekTo 호출: ${seconds}초`);
          playerRef.current.seekTo(seconds, true);
        } else {
          console.warn('seekTo 실패: 플레이어가 초기화되지 않았습니다.');
        }
      } catch (error) {
        console.error('seekTo 오류:', error);
      }
    },
    playVideo: () => {
      try {
        if (playerRef.current) {
          console.log('playVideo 호출');
          playerRef.current.playVideo();
        } else {
          console.warn('playVideo 실패: 플레이어가 초기화되지 않았습니다.');
        }
      } catch (error) {
        console.error('playVideo 오류:', error);
      }
    },
    pauseVideo: () => {
      try {
        if (playerRef.current) {
          console.log('pauseVideo 호출');
          playerRef.current.pauseVideo();
        } else {
          console.warn('pauseVideo 실패: 플레이어가 초기화되지 않았습니다.');
        }
      } catch (error) {
        console.error('pauseVideo 오류:', error);
      }
    }
  }));
  
  // 비디오 정보 로깅
  useEffect(() => {
    if (video) {
      console.log('VideoPlayer - 비디오 정보 변경:', {
        id: video.id,
        title: video.title,
        youtubeId: video.youtubeId,
        isPlaying,
        currentTime,
        hasUserInteracted: hasUserInteractedRef.current
      });
      
      // 플레이어가 이미 초기화되어 있고 비디오가 재생 중이고 사용자 조작이 없었을 때만 다이얼로그 표시
      if (playerRef.current && isPlaying && currentTime > 0 && !initialSyncDoneRef.current && !hasUserInteractedRef.current) {
        // 다이얼로그 표시 시간 설정
        setSyncDialogTime(currentTime);
        syncDialogTimeRef.current = currentTime;
        syncStartTimeRef.current = Date.now();
        setShowSyncDialog(true);
      } else if (playerRef.current && isPlaying && currentTime > 0 && !initialSyncDoneRef.current && hasUserInteractedRef.current) {
        // 사용자 조작이 있었다면 다이얼로그 없이 바로 재생
        console.log('사용자 조작이 있었으므로 다이얼로그 없이 바로 재생');
        try {
          if (playerRef.current) {
            playerRef.current.seekTo(currentTime, true);
            playerRef.current.playVideo();
            initialSyncDoneRef.current = true;
          }
        } catch (error) {
          console.error('비디오 재생 오류:', error);
        }
      }
    } else {
      console.log('VideoPlayer - 비디오 없음');
      // 비디오가 없을 때 초기화 상태 리셋
      initialSyncDoneRef.current = false;
    }
  }, [video, isPlaying, currentTime]);
  
  // 플레이어 초기화
  const handleReady = (event: YouTubeEvent) => {
    try {
      playerRef.current = event.target;
      
      // 플레이어가 유효한지 확인
      if (!playerRef.current) {
        console.error('플레이어 초기화 실패: 플레이어 참조가 null입니다.');
        setPlayerError(true);
        return;
      }
      
      // 비디오 ID가 유효한지 확인
      if (!video?.youtubeId) {
        console.error('플레이어 초기화 실패: 유효하지 않은 비디오 ID');
        setPlayerError(true);
        return;
      }
      
      const playerDuration = playerRef.current.getDuration();
      setDuration(playerDuration);
      setPlayerError(false);
      
      console.log('플레이어 초기화 완료, 초기 상태:', { 
        currentTime, 
        isPlaying,
        playerDuration,
        videoId: video?.youtubeId,
        hasUserInteracted: hasUserInteractedRef.current
      });
      
      // 초기 시간 설정 (즉시 적용)
      console.log('초기 시간 설정:', currentTime);
      playerRef.current.seekTo(currentTime, true);
      
      // 비디오가 재생 중이고 초기화가 안 되었고 사용자 조작이 없었을 때만 다이얼로그 표시
      if (isPlaying && currentTime > 0 && !initialSyncDoneRef.current && !hasUserInteractedRef.current) {
        // 다이얼로그 표시 시간 설정
        setSyncDialogTime(currentTime);
        syncDialogTimeRef.current = currentTime;
        syncStartTimeRef.current = Date.now();
        setShowSyncDialog(true);
      } else {
        // 재생 중이 아니거나 이미 초기화되었거나 사용자 조작이 있었으면 바로 상태 적용
        setTimeout(() => {
          if (playerRef.current) {
            if (isPlaying) {
              console.log('초기 재생 시작');
              playerRef.current.playVideo();
            } else {
              console.log('초기 일시정지 설정');
              playerRef.current.pauseVideo();
            }
            // 초기화 완료 표시
            initialSyncDoneRef.current = true;
          }
        }, 300); // 0.3초 지연 (성능 개선)
      }
    } catch (error) {
      console.error('YouTube player initialization error:', error);
      setPlayerError(true);
    }
  };
  
  // 따라서 재생 다이얼로그 확인 버튼 클릭 핸들러
  const handleSyncConfirm = () => {
    if (!playerRef.current) return;
    
    // 다이얼로그가 표시된 이후 경과 시간 계산
    const now = Date.now();
    const elapsedSeconds = (now - syncStartTimeRef.current) / 1000;
    
    // 현재 시간 계산 (다이얼로그 표시 시간 + 경과 시간)
    const adjustedTime = syncDialogTimeRef.current + elapsedSeconds;
    
    console.log('따라서 재생 확인:', {
      dialogTime: syncDialogTimeRef.current,
      elapsedSeconds,
      adjustedTime
    });
    
    // 시간 설정 및 재생 시작 (지연 없이 즉시 적용)
    playerRef.current.seekTo(adjustedTime, true);
    playerRef.current.playVideo();
    
    // 다이얼로그 닫기
    setShowSyncDialog(false);
    
    // 초기화 완료 표시
    initialSyncDoneRef.current = true;
    
    // 사용자 조작 여부 표시 (다이얼로그 확인도 사용자 조작으로 간주)
    hasUserInteractedRef.current = true;
  };
  
  // 따라서 재생 다이얼로그 취소 버튼 클릭 핸들러
  const handleSyncCancel = () => {
    if (!playerRef.current) return;
    
    // 처음부터 재생 (0초로 설정하고 일시정지)
    playerRef.current.seekTo(0, true);
    playerRef.current.pauseVideo();
    
    // 서버에 일시정지 이벤트 전송
    onPause();
    
    // 다이얼로그 닫기
    setShowSyncDialog(false);
    
    // 초기화 완료 표시
    initialSyncDoneRef.current = true;
    
    // 사용자 조작 여부 표시 (다이얼로그 취소도 사용자 조작으로 간주)
    hasUserInteractedRef.current = true;
  };
  
  // 플레이어 오류 핸들러
  const handleError = (event: YouTubeEvent) => {
    console.error('YouTube player error:', event.data);
    setPlayerError(true);
  };
  
  // 플레이어 상태 변경 핸들러
  const handleStateChange = (event: YouTubeEvent) => {
    const newState = event.data;
    console.log('YouTube 플레이어 상태 변경:', newState, '이전 상태:', playerState);
    
    setPlayerState(newState);
    
    // 상태 코드: -1(미시작), 0(종료), 1(재생 중), 2(일시정지), 3(버퍼링), 5(큐 대기)
    
    // 재생 중이면 현재 시간 업데이트
    if (newState === 1) {
      const currentPlayerTime = event.target.getCurrentTime();
      setLocalCurrentTime(currentPlayerTime);
      setSeekValue(currentPlayerTime);
      setPlayerError(false);
      
      // 외부에서 재생 상태가 false인데 플레이어가 재생 중이면 콜백 호출
      if (!isPlaying && !isUserControlledRef.current && !showSyncDialog) {
        console.log('플레이어가 자동으로 재생됨, 상태 동기화');
        // 사용자 제어 시작 (중복 이벤트 방지)
        isUserControlledRef.current = true;
        // 사용자 조작 여부 표시 (사용자가 직접 재생 버튼을 누른 경우)
        hasUserInteractedRef.current = true;
        // 현재 시간 전달
        onPlay();
        // 사용자 제어 종료 (1초 후)
        setTimeout(() => {
          isUserControlledRef.current = false;
        }, 1000);
      }
    } 
    // 일시정지 상태이면 현재 시간 업데이트
    else if (newState === 2) {
      const currentPlayerTime = event.target.getCurrentTime();
      setLocalCurrentTime(currentPlayerTime);
      setSeekValue(currentPlayerTime);
      
      // 외부에서 재생 상태가 true인데 플레이어가 일시정지 상태면 콜백 호출
      if (isPlaying && !isUserControlledRef.current && !showSyncDialog) {
        console.log('플레이어가 자동으로 일시정지됨, 상태 동기화');
        // 사용자 제어 시작 (중복 이벤트 방지)
        isUserControlledRef.current = true;
        // 사용자 조작 여부 표시 (사용자가 직접 일시정지 버튼을 누른 경우)
        hasUserInteractedRef.current = true;
        // 현재 시간 전달
        onPause();
        // 사용자 제어 종료 (1초 후)
        setTimeout(() => {
          isUserControlledRef.current = false;
        }, 1000);
      }
    }
    // 비디오 종료 시 다음 비디오로 넘어가기
    else if (newState === 0) {
      console.log('비디오 재생 완료, 다음 비디오로 넘어가기');
      
      // 이미 종료 처리되었거나 스킵 중이면 중복 호출 방지
      if (videoEndedRef.current || isSkippingRef.current) {
        console.log('이미 비디오 종료 처리 중, 중복 호출 무시');
        return;
      }
      
      // 종료 및 스킵 상태 설정
      videoEndedRef.current = true;
      isSkippingRef.current = true;
      
      // 사용자 조작 여부 표시 (비디오 종료도 사용자 조작으로 간주)
      hasUserInteractedRef.current = true;
      
      // 다음 비디오로 넘어가기 전에 현재 비디오 정보 초기화
      initialSyncDoneRef.current = false;
      
      // onEnded가 제공된 경우 호출, 아니면 onSkip 호출
      if (onEnded) {
        console.log('비디오 종료 이벤트 핸들러 호출 (onEnded)');
        onEnded();
      } else {
        console.log('비디오 종료 시 건너뛰기 핸들러 호출 (onSkip)');
        onSkip();
      }
      
      // 일정 시간 후 스킵 상태 초기화 (다음 스킵을 위해)
      if (skipTimeoutRef.current) {
        clearTimeout(skipTimeoutRef.current);
      }
      
      skipTimeoutRef.current = setTimeout(() => {
        isSkippingRef.current = false;
        videoEndedRef.current = false;
        skipTimeoutRef.current = null;
      }, 3000); // 3초 동안 추가 스킵 방지
    }
    // 버퍼링 상태 처리
    else if (newState === 3) {
      console.log('비디오 버퍼링 중');
      // 버퍼링 중에도 현재 시간 업데이트
      const currentPlayerTime = event.target.getCurrentTime();
      setLocalCurrentTime(currentPlayerTime);
      setSeekValue(currentPlayerTime);
    }
  };
  
  // 재생 상태 변경 시 플레이어 제어
  useEffect(() => {
    if (!playerRef.current || playerError || showSyncDialog) return;
    
    try {
      console.log('재생 상태 변경 감지:', isPlaying, '현재 플레이어 상태:', playerState);
      
      // 즉시 재생 상태 적용
      if (isPlaying) {
        if (playerState !== 1) { // 1은 재생 중 상태
          console.log('재생 명령 즉시 실행');
          playerRef.current.playVideo();
        }
      } else {
        if (playerState !== 2) { // 2는 일시정지 상태
          console.log('일시정지 명령 즉시 실행');
          playerRef.current.pauseVideo();
        }
      }
    } catch (error) {
      console.error('YouTube player control error:', error);
      setPlayerError(true);
    }
  }, [isPlaying, playerState, playerError, showSyncDialog]);
  
  // 현재 시간 변경 시 플레이어 제어
  useEffect(() => {
    if (!playerRef.current || isSeeking || playerError || showSyncDialog) return;
    
    try {
      // 마지막 동기화 후 일정 시간이 지났을 때만 동기화
      const now = Date.now();
      if (now - lastSyncTimeRef.current < 100) return; // 100ms로 단축 (성능 개선)
      
      // 사용자 제어 중이면 동기화 무시
      if (isUserControlledRef.current) {
        console.log('사용자 제어 중이므로 시간 동기화 무시');
        return;
      }
      
      // 현재 시간 차이가 0.5초 이상일 때만 시간 조정
      const playerTime = playerRef.current.getCurrentTime();
      const timeDiff = Math.abs(playerTime - currentTime);
      
      if (timeDiff > 0.5) {
        console.log('시간 동기화 실행:', playerTime, currentTime, '차이:', timeDiff);
        playerRef.current.seekTo(currentTime, true);
        lastSyncTimeRef.current = now;
      }
      
      setLocalCurrentTime(playerRef.current.getCurrentTime());
      setSeekValue(playerRef.current.getCurrentTime());
    } catch (error) {
      console.error('YouTube player seek error:', error);
      setPlayerError(true);
    }
  }, [currentTime, isSeeking, playerError, showSyncDialog]);
  
  // 주기적으로 로컬 시간 업데이트 (UI 표시용)
  useEffect(() => {
    if (!playerRef.current || playerError) return;
    
    const interval = setInterval(() => {
      try {
        if (playerRef.current && playerState === 1 && !isSeeking && !isUserControlledRef.current) {
          const currentPlayerTime = playerRef.current.getCurrentTime();
          setLocalCurrentTime(currentPlayerTime);
          setSeekValue(currentPlayerTime);
        }
      } catch (error) {
        console.error('YouTube player time update error:', error);
        setPlayerError(true);
        clearInterval(interval);
      }
    }, 100); // 100ms로 단축 (UI 업데이트 빈도 증가)
    
    return () => clearInterval(interval);
  }, [playerState, isSeeking, playerError]);
  
  // 탐색 시작 핸들러
  const handleSeekStart = () => {
    setIsSeeking(true);
    isUserControlledRef.current = true;
    // 사용자 조작 여부 표시
    hasUserInteractedRef.current = true;
  };
  
  // 탐색 중 핸들러
  const handleSeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSeekValue(parseFloat(e.target.value));
  };
  
  // 탐색 완료 핸들러
  const handleSeekEnd = () => {
    if (!playerRef.current || playerError) return;
    
    try {
      const newTime = seekValue;
      playerRef.current.seekTo(newTime, true);
      setLocalCurrentTime(newTime);
      
      // 탐색은 클라이언트 시간을 서버로 전송 (예외적으로 허용)
      onSeek(newTime);
      
      setIsSeeking(false);
      
      // 사용자 제어 후 일정 시간 동안 서버 동기화 무시
      setTimeout(() => {
        isUserControlledRef.current = false;
      }, 3000); // 3초 동안 서버 동기화 무시
    } catch (error) {
      console.error('YouTube player seek end error:', error);
      setPlayerError(true);
    }
  };
  
  // 재생/일시정지 토글 핸들러
  const handlePlayPause = () => {
    if (!playerRef.current || playerError) return;
    
    try {
      isUserControlledRef.current = true;
      // 사용자 조작 여부 표시
      hasUserInteractedRef.current = true;
      
      if (playerState === 1) {
        playerRef.current.pauseVideo();
        // 서버 시간 사용을 위해 currentPlayerTime 전달하지 않음
        onPause();
      } else {
        playerRef.current.playVideo();
        // 서버 시간 사용을 위해 currentPlayerTime 전달하지 않음
        onPlay();
      }
      
      // 사용자 제어 후 일정 시간 동안 서버 동기화 무시
      setTimeout(() => {
        isUserControlledRef.current = false;
      }, 3000); // 3초 동안 서버 동기화 무시
    } catch (error) {
      console.error('YouTube player play/pause error:', error);
      setPlayerError(true);
    }
  };
  
  // 비디오 변경 감지
  useEffect(() => {
    // 비디오가 변경되면 초기화 상태 리셋
    if (video?.id) {
      console.log('비디오 변경 감지:', video.title);
      initialSyncDoneRef.current = false;
      setPlayerError(false);
      
      // 비디오 ID가 변경되면 종료 상태 및 스킵 상태 초기화
      videoEndedRef.current = false;
      isSkippingRef.current = false;
      
      if (skipTimeoutRef.current) {
        clearTimeout(skipTimeoutRef.current);
        skipTimeoutRef.current = null;
      }
      
      // 플레이어가 이미 초기화되어 있으면 즉시 재생 상태 적용
      if (playerRef.current) {
        try {
          // 시간 설정
          console.log('비디오 변경 후 시간 설정:', currentTime);
          playerRef.current.seekTo(currentTime, true);
          
          // 비디오가 재생 중이고 초기화가 안 되었고 사용자 조작이 없었을 때만 다이얼로그 표시
          if (isPlaying && currentTime > 0 && !initialSyncDoneRef.current && !hasUserInteractedRef.current) {
            // 다이얼로그 표시 시간 설정
            setSyncDialogTime(currentTime);
            syncDialogTimeRef.current = currentTime;
            syncStartTimeRef.current = Date.now();
            setShowSyncDialog(true);
          } else {
            // 재생 중이 아니거나 이미 초기화되었거나 사용자 조작이 있었으면 바로 상태 적용
            setTimeout(() => {
              if (playerRef.current) {
                if (isPlaying) {
                  console.log('비디오 변경 후 재생 시작');
                  playerRef.current.playVideo();
                } else {
                  console.log('비디오 변경 후 일시정지');
                  playerRef.current.pauseVideo();
                }
                initialSyncDoneRef.current = true;
              }
            }, 300); // 0.3초 지연 (성능 개선)
          }
        } catch (error) {
          console.error('비디오 변경 후 플레이어 제어 오류:', error);
          setPlayerError(false); // 오류 상태 초기화 (다음 시도에서 다시 시도)
        }
      } else {
        console.log('플레이어가 아직 초기화되지 않았습니다. 초기화 후 상태를 적용합니다.');
        // 플레이어가 초기화되지 않았으면 초기화 상태만 리셋하고 handleReady에서 처리
      }
    }
  }, [video?.id, currentTime, isPlaying]);
  
  // 컴포넌트 언마운트 시 타이머 정리
  useEffect(() => {
    return () => {
      if (skipTimeoutRef.current) {
        clearTimeout(skipTimeoutRef.current);
        skipTimeoutRef.current = null;
      }
    };
  }, []);
  
  // 비디오가 없을 때 표시할 내용
  if (!video) {
    return (
      <div className="aspect-video bg-dark-700 rounded-lg flex items-center justify-center mb-4">
        <div className="text-center p-8">
          <h3 className="text-xl font-bold mb-2">재생 중인 비디오가 없습니다</h3>
          <p className="text-dark-300 mb-4">
            검색을 통해 비디오를 추가해보세요
          </p>
        </div>
      </div>
    );
  }
  
  // 비디오 ID가 유효한지 확인
  const isValidVideoId = video?.youtubeId && typeof video.youtubeId === 'string' && video.youtubeId.length > 0;
  
  console.log('VideoPlayer 렌더링:', {
    videoId: video?.youtubeId,
    isValidVideoId,
    playerError
  });
  
  // 플레이어 오류 또는 유효하지 않은 비디오 ID일 때 표시할 내용
  if (playerError || !isValidVideoId) {
    return (
      <div className="aspect-video bg-dark-700 rounded-lg flex items-center justify-center mb-4">
        <div className="text-center p-8">
          <h3 className="text-xl font-bold mb-2">비디오를 재생할 수 없습니다</h3>
          <p className="text-dark-300 mb-4">
            {playerError ? '플레이어 오류가 발생했습니다' : '유효하지 않은 비디오 ID입니다'}
          </p>
          <button
            onClick={() => {
              // 이미 스킵 중이거나 종료 처리 중이면 중복 호출 방지
              if (isSkippingRef.current || videoEndedRef.current) {
                console.log('이미 다음 비디오로 넘어가는 중, 중복 호출 무시');
                return;
              }
              
              // 스킵 및 종료 상태 설정
              isSkippingRef.current = true;
              videoEndedRef.current = true;
              
              // 사용자 조작 여부 표시 (건너뛰기 버튼 클릭도 사용자 조작으로 간주)
              hasUserInteractedRef.current = true;
              // 다음 비디오로 넘어가기 전에 현재 비디오 정보 초기화
              initialSyncDoneRef.current = false;
              onSkip();
              
              // 일정 시간 후 스킵 상태 초기화 (다음 스킵을 위해)
              if (skipTimeoutRef.current) {
                clearTimeout(skipTimeoutRef.current);
              }
              
              skipTimeoutRef.current = setTimeout(() => {
                isSkippingRef.current = false;
                videoEndedRef.current = false;
                skipTimeoutRef.current = null;
              }, 3000); // 3초 동안 추가 스킵 방지
            }}
            className="px-4 py-2 bg-primary-600 hover:bg-primary-700 rounded transition-colors"
          >
            다음 곡으로 넘어가기
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="mb-4 relative">
      <div className="aspect-video bg-dark-900 rounded-lg overflow-hidden">
        {isValidVideoId && (
          <YouTube
            videoId={video.youtubeId}
            opts={{
              width: '100%',
              height: '100%',
              playerVars: {
                autoplay: 0, // 자동 재생 비활성화 (수동으로 제어)
                controls: 0,
                disablekb: 1,
                fs: 0,
                modestbranding: 1,
                rel: 0,
                origin: window.location.origin,
              },
            }}
            onReady={handleReady}
            onStateChange={handleStateChange}
            onError={handleError}
            className="w-full h-full"
          />
        )}
      </div>
      
      {/* 따라서 재생 다이얼로그 */}
      {showSyncDialog && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-70 z-10">
          <div className="bg-dark-800 p-6 rounded-lg shadow-lg max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">비디오가 재생 중입니다</h3>
            <p className="mb-4">
              현재 {formatTime(syncDialogTime)} 시점에서 재생 중입니다. 
              함께 시청하시겠습니까?
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={handleSyncCancel}
                className="px-4 py-2 bg-dark-600 hover:bg-dark-500 rounded transition-colors"
              >
                처음부터 보기
              </button>
              <button
                onClick={handleSyncConfirm}
                className="px-4 py-2 bg-primary-600 hover:bg-primary-700 rounded transition-colors"
                autoFocus
              >
                따라서 재생
              </button>
            </div>
          </div>
        </div>
      )}
      
      <div className="mt-2 p-4 bg-dark-800 rounded-lg">
        <h3 className="text-lg font-bold mb-2">{video.title}</h3>
        
        <div className="flex items-center mb-2">
          <button
            onClick={handlePlayPause}
            className="bg-primary-600 hover:bg-primary-700 rounded-full w-10 h-10 flex items-center justify-center mr-4"
          >
            {playerState === 1 ? (
              <span className="sr-only">일시정지</span>
            ) : (
              <span className="sr-only">재생</span>
            )}
            {playerState === 1 ? '⏸️' : '▶️'}
          </button>
          
          <div className="flex-1 flex items-center">
            <span className="text-sm mr-2 w-12 text-right">
              {formatTime(localCurrentTime)}
            </span>
            <input
              type="range"
              min="0"
              max={duration || 100}
              step="0.1"
              value={seekValue}
              onChange={handleSeekChange}
              onMouseDown={handleSeekStart}
              onMouseUp={handleSeekEnd}
              onTouchStart={handleSeekStart}
              onTouchEnd={handleSeekEnd}
              className="flex-1 h-2 bg-dark-600 rounded-full appearance-none cursor-pointer"
            />
            <span className="text-sm ml-2 w-12">
              {formatTime(duration)}
            </span>
          </div>
          
          <button
            onClick={() => {
              // 이미 스킵 중이거나 종료 처리 중이면 중복 호출 방지
              if (isSkippingRef.current || videoEndedRef.current) {
                console.log('이미 다음 비디오로 넘어가는 중, 중복 호출 무시');
                return;
              }
              
              // 스킵 및 종료 상태 설정
              isSkippingRef.current = true;
              videoEndedRef.current = true;
              
              // 사용자 조작 여부 표시 (건너뛰기 버튼 클릭도 사용자 조작으로 간주)
              hasUserInteractedRef.current = true;
              // 다음 비디오로 넘어가기 전에 현재 비디오 정보 초기화
              initialSyncDoneRef.current = false;
              onSkip();
              
              // 일정 시간 후 스킵 상태 초기화 (다음 스킵을 위해)
              if (skipTimeoutRef.current) {
                clearTimeout(skipTimeoutRef.current);
              }
              
              skipTimeoutRef.current = setTimeout(() => {
                isSkippingRef.current = false;
                videoEndedRef.current = false;
                skipTimeoutRef.current = null;
              }, 3000); // 3초 동안 추가 스킵 방지
            }}
            className="bg-dark-600 hover:bg-dark-500 rounded-full w-10 h-10 flex items-center justify-center ml-4"
            title="다음 곡"
          >
            <span className="sr-only">다음 곡</span>
            ⏭️
          </button>
        </div>
      </div>
    </div>
  );
});

export default VideoPlayer; 