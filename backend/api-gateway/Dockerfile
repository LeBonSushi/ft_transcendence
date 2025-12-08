FROM node:20-alpine
WORKDIR /app
COPY backend/api-gateway/package.json backend/api-gateway/package-lock.json* ./
RUN npm install
COPY backend/api-gateway/ ./
EXPOSE 8080
CMD ["npm", "run", "start"]
