FROM oven/bun:1.3
WORKDIR /app

COPY package.json bun.lock turbo.json ./
COPY apps/backend ./apps/backend
COPY apps/ws/package.json ./apps/ws/package.json
COPY apps/frontend/package.json ./apps/frontend/package.json
COPY packages ./packages

RUN bun install --frozen-lockfile

WORKDIR /app/packages/db
ENV DATABASE_URL=postgresql://matiks:matiks@db:5432/matiks
RUN bunx prisma generate --config prisma7.config.ts

WORKDIR /app/apps/backend
ENV PORT=4000
EXPOSE 4000

CMD ["bun", "index.ts"]
