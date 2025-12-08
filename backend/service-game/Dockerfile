FROM node:20-alpine
WORKDIR /app
COPY backend/service-game/package.json backend/service-game/package-lock.json* ./
RUN npm install
COPY backend/service-game/ ./
COPY database/prisma ./
RUN npx prisma generate
EXPOSE 4003
CMD ["npm", "run", "start"]
