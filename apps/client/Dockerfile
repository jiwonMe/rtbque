FROM node:18-alpine AS base

# 작업 디렉토리 설정
WORKDIR /app

# pnpm 설치
RUN corepack enable && corepack prepare pnpm@8.6.0 --activate

# 모든 패키지의 package.json 복사
FROM base AS installer
COPY pnpm-lock.yaml pnpm-workspace.yaml ./
COPY package.json ./
COPY apps/client/package.json ./apps/client/
COPY packages/shared/package.json ./packages/shared/

# 의존성 설치
RUN pnpm install --frozen-lockfile

# 소스 코드 복사
COPY packages/shared ./packages/shared
COPY apps/client ./apps/client

# 빌드
RUN pnpm --filter shared build && pnpm --filter client build

# 프로덕션 이미지
FROM base AS runner
WORKDIR /app

# 환경 변수 설정
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Next.js 관련 폴더 생성
RUN mkdir -p /app/apps/client/.next/cache

# 빌드된 앱과 필요한 파일 복사
COPY --from=installer /app/apps/client/next.config.js ./apps/client/
COPY --from=installer /app/apps/client/package.json ./apps/client/
COPY --from=installer /app/apps/client/public ./apps/client/public
COPY --from=installer /app/apps/client/.next ./apps/client/.next
COPY --from=installer /app/node_modules ./node_modules
COPY --from=installer /app/packages/shared/dist ./packages/shared/dist
COPY --from=installer /app/packages/shared/package.json ./packages/shared/package.json

# 포트 노출
EXPOSE 3000

# 작업 디렉토리 변경
WORKDIR /app/apps/client

# 앱 실행
CMD ["pnpm", "start"] 