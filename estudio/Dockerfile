# Imagem com Chromium (motor 3D), ffmpeg (montagem do MP4) e Node
FROM mcr.microsoft.com/playwright:v1.63.0-noble
RUN apt-get update && apt-get install -y --no-install-recommends ffmpeg fonts-dejavu-core && rm -rf /var/lib/apt/lists/*
WORKDIR /app
# o repositório inteiro: o estúdio usa a skill em .claude/skills/video-3d-ola
COPY . /app
WORKDIR /app/estudio
RUN npm ci --omit=dev || npm install --omit=dev
ENV PORT=3000 NODE_ENV=production
EXPOSE 3000
CMD ["node", "server.js"]
