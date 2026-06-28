# Dependencies stage
FROM node:20-alpine AS deps

WORKDIR /app

COPY package*.json ./

RUN npm ci --only=production

# Production stage
FROM node:20-alpine AS runner

WORKDIR /app

COPY --from=deps --chown=node:node /app/node_modules ./node_modules
COPY --chown=node:node src ./src
COPY --chown=node:node package*.json ./
COPY --chown=node:node images ./images

RUN if [ -d images ]; then mv images images-seed; else mkdir -p images-seed; fi && mkdir -p images

EXPOSE 3001

USER node

CMD ["node", "src/server.js"]
