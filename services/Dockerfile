# Etapa de dependencias
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
RUN apk add --no-cache ffmpeg
COPY . .

# Etapa de runtime (mínima y segura)
FROM node:18-alpine
WORKDIR /app
# FFmpeg es necesario para el controlador de streaming HLS
RUN apk add --no-cache ffmpeg
COPY --from=builder /app /app

# Hardening: Usuario sin privilegios
RUN chown -R node:node /app
USER node

EXPOSE 4000
CMD ["node", "index.js"]
