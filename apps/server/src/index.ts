// 가장 먼저 환경 변수 로드
import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { SocketEvents } from 'shared';
import { setupSocketIO } from './socket';
import { searchYouTube } from './services/youtubeService';
import { youtubeRouter } from './routes/youtube';

const app = express();
const PORT = process.env.PORT || 3001;

// CORS 설정
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  methods: ['GET', 'POST'],
  credentials: true
}));

// YouTube 검색 API 엔드포인트
app.get('/api/search', async (req, res) => {
  try {
    const query = req.query.q as string;
    if (!query) {
      return res.status(400).json({ error: '검색어가 필요합니다.' });
    }
    
    const results = await searchYouTube(query);
    res.json(results);
  } catch (error) {
    console.error('YouTube 검색 오류:', error);
    res.status(500).json({ error: '검색 중 오류가 발생했습니다.' });
  }
});

// YouTube 라우터 추가
app.use('/api/youtube', youtubeRouter);

// 기본 라우트
app.get('/', (req, res) => {
  res.send('RTBQue API 서버');
});

// 서버 생성
const server = http.createServer(app);

// Socket.IO 설정
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Socket.IO 핸들러 설정
setupSocketIO(io);

// 서버 시작
server.listen(PORT, () => {
  console.log(`서버가 http://localhost:${PORT} 에서 실행 중입니다.`);
}); 