FROM node:20-alpine
WORKDIR /app
COPY backend/service-chat/package.json backend/service-chat/package-lock.json* ./
RUN npm install
COPY backend/service-chat/ ./
COPY database/prisma ./
RUN npx prisma generate
EXPOSE 4002
CMD ["npm", "run", "start"]
