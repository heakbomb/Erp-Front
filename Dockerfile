# 1단계: 빌드 스테이지
FROM node:20-alpine AS build
# pnpm 설치
RUN npm install -g pnpm
WORKDIR /app

# 의존성 파일만 먼저 복사 (캐시 효율화)
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --no-frozen-lockfile

# 전체 소스 복사 및 빌드
COPY . .

# 빌드 시점에 변수를 주입받도록 설정
ARG NEXT_PUBLIC_API_URL=/api
ARG NEXT_PUBLIC_APP_URL
ARG NEXT_PUBLIC_KAKAO_CLIENT_ID
ARG NEXT_PUBLIC_NAVER_MAP_CLIENT_ID
ARG NEXT_PUBLIC_PORTONE_STORE_ID
ARG NEXT_PUBLIC_PORTONE_CHANNEL_KEY

ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
ENV NEXT_PUBLIC_APP_URL=${NEXT_PUBLIC_APP_URL}
ENV NEXT_PUBLIC_KAKAO_CLIENT_ID=${NEXT_PUBLIC_KAKAO_CLIENT_ID}
ENV NEXT_PUBLIC_NAVER_MAP_CLIENT_ID=${NEXT_PUBLIC_NAVER_MAP_CLIENT_ID}
ENV NEXT_PUBLIC_PORTONE_STORE_ID=${NEXT_PUBLIC_PORTONE_STORE_ID}
ENV NEXT_PUBLIC_PORTONE_CHANNEL_KEY=${NEXT_PUBLIC_PORTONE_CHANNEL_KEY}

RUN pnpm run build

# 2단계: 실행 스테이지 (Nginx)
FROM nginx:stable-alpine
# Next.js 'output: export' 설정 시 결과물은 out 폴더에 생깁니다.
COPY --from=build /app/out /usr/share/nginx/html
# 프록시 설정을 포함한 커스텀 nginx 설정 복사 (아래 3번 참고)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]