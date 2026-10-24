# --- Stage 1: install production dependencies -------------------------------
FROM node:20-alpine AS deps
WORKDIR /app
COPY app/package.json ./
RUN npm install --omit=dev

# --- Stage 2: minimal runtime ------------------------------------------------
FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=8080
COPY --from=deps /app/node_modules ./node_modules
COPY app/ ./
EXPOSE 8080
USER node
CMD ["node", "server.js"]
