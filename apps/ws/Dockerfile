FROM oven/bun:1.3
WORKDIR /app

COPY package.json bun.lock turbo.json ./
COPY apps/ws ./apps/ws
COPY apps/backend/package.json ./apps/backend/package.json
COPY apps/frontend/package.json ./apps/frontend/package.json
COPY packages ./packages

RUN bun install --frozen-lockfile

WORKDIR /app/packages/db
ENV DATABASE_URL=postgresql://matiks:matiks@db:5432/matiks
RUN bunx prisma generate --config prisma7.config.ts

WORKDIR /app/apps/ws
ENV WS_PORT=8080
EXPOSE 8080

CMD ["bun", "index.ts"]
