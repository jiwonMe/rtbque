# RTBQue - 동기화된 음악 재생 웹 애플리케이션

여러 사용자가 동시에 음악을 감상할 수 있는 실시간 동기화 플랫폼입니다. 유튜브 영상을 검색하고 재생 목록에 추가하여 함께 감상할 수 있습니다.

## 주요 기능

- 실시간 음악 동기화 재생
- 유튜브 영상 검색 및 재생
- 재생 목록 관리
- 방 생성 및 참가
- 사용자 간 실시간 상호작용

## 기술 스택

- **프론트엔드**: Next.js, React, TypeScript, Tailwind CSS, Socket.IO Client
- **백엔드**: Node.js, Express, Socket.IO, YouTube API
- **패키지 관리**: pnpm, Turborepo
- **컨테이너화**: Docker

## 시작하기

### 개발 환경 설정

1. 저장소 클론

```bash
git clone https://github.com/yourusername/rtbque.git
cd rtbque
```

2. 의존성 설치

```bash
pnpm install
```

3. 환경 변수 설정

```bash
cp apps/server/.env.example apps/server/.env
```

`.env` 파일을 편집하여 YouTube API 키를 설정합니다.

4. 개발 서버 실행

```bash
pnpm dev
```

### Docker로 실행

```bash
docker-compose up -d
```

## 프로젝트 구조

```
rtbque/
├── apps/
│   ├── client/         # Next.js 클라이언트 앱
│   └── server/         # Express 서버 앱
├── packages/
│   └── shared/         # 공유 타입 및 유틸리티
├── docker-compose.yml
├── pnpm-workspace.yaml
└── turbo.json
```

## 사용 방법

1. 메인 페이지에서 이름을 입력하고 새 방을 만들거나 기존 방 코드를 입력하여 참가합니다.
2. 방에 입장한 후 검색 패널에서 음악을 검색합니다.
3. 원하는 음악을 재생 목록에 추가합니다.
4. 재생, 일시정지, 건너뛰기 등의 컨트롤을 사용하여 음악을 제어합니다.
5. 모든 참가자는 동기화된 음악을 함께 감상할 수 있습니다.

## 라이선스

ISC 