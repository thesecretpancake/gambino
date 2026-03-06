# Stage 1: Build
FROM node:24.14.0-slim AS builder
WORKDIR /usr/src/app
COPY package*.json ./
RUN HUSKY=0 npm ci
COPY . .
RUN npm run build

# Stage 2: Runtime
FROM node:24.14.0-slim
WORKDIR /usr/src/app
RUN apt-get update && apt-get install -y ca-certificates && rm -rf /var/lib/apt/lists/*
COPY --from=builder --chown=node:node /usr/src/app/dist ./dist
COPY --chown=node:node package*.json ./
RUN npm ci --omit=dev --ignore-scripts
USER node
CMD ["node", "dist/main"]
