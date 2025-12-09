FROM node:20-alpine
WORKDIR /app
COPY backend/service-user/package.json backend/service-user/package-lock.json* ./
RUN npm install
COPY backend/service-user/ ./
COPY database/prisma ./prisma
RUN npx prisma generate
EXPOSE 4004
CMD ["npm", "run", "start"]
