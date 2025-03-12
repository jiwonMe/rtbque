FROM node:18-alpine AS base

# 작업 디렉토리 설정
WORKDIR /app

# pnpm 설치
RUN corepack enable && corepack prepare pnpm@8.6.0 --activate

# 모든 패키지의 package.json 복사
FROM base AS installer
COPY pnpm-lock.yaml pnpm-workspace.yaml ./
COPY package.json ./
COPY apps/server/package.json ./apps/server/
COPY packages/shared/package.json ./packages/shared/

# 의존성 설치
RUN pnpm install --frozen-lockfile

# 소스 코드 복사
COPY packages/shared ./packages/shared
COPY apps/server ./apps/server

# 빌드
RUN pnpm --filter shared build && pnpm --filter server build

# 프로덕션 이미지
FROM base AS runner
WORKDIR /app

# 환경 변수 설정
ENV NODE_ENV=production

# 빌드된 앱과 필요한 파일 복사
COPY --from=installer /app/node_modules ./node_modules
COPY --from=installer /app/packages/shared/dist ./packages/shared/dist
COPY --from=installer /app/packages/shared/package.json ./packages/shared/package.json
COPY --from=installer /app/apps/server/dist ./apps/server/dist
COPY --from=installer /app/apps/server/package.json ./apps/server/package.json

# 데이터 디렉토리 생성
RUN mkdir -p /app/data

# 포트 노출
EXPOSE 4000

# 앱 실행
CMD ["node", "apps/server/dist/index.js"] 