FROM oven/bun:1.3
WORKDIR /app

COPY package.json bun.lock turbo.json ./
COPY apps/frontend ./apps/frontend
COPY apps/backend/package.json ./apps/backend/package.json
COPY apps/ws/package.json ./apps/ws/package.json
COPY packages ./packages

RUN bun install --frozen-lockfile

WORKDIR /app/apps/frontend
ENV HOSTNAME=0.0.0.0
ENV PORT=3000
ENV API_ORIGIN=http://backend:4000

RUN bun run build

EXPOSE 3000
CMD ["bun", "run", "start"]
