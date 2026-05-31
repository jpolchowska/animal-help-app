FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm ci --only=production

COPY --chown=node:node . .

RUN if [ -d images ]; then mv images images-seed; else mkdir -p images-seed; fi && mkdir -p images

EXPOSE 3001

USER node

CMD ["node", "server.js"]
