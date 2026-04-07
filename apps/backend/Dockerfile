FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json ./
COPY apps/backend/package.json apps/backend/package.json
RUN npm install
COPY apps/backend apps/backend
WORKDIR /app/apps/backend
RUN npm run build

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/node_modules /app/node_modules
COPY --from=builder /app/apps/backend/dist ./dist
COPY --from=builder /app/apps/backend/package.json ./package.json
EXPOSE 4000
CMD ["node", "dist/server.js"]