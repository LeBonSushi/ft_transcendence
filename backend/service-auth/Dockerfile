FROM node:20-alpine
WORKDIR /app
COPY backend/service-auth/package.json backend/service-auth/package-lock.json* ./
RUN npm install
COPY backend/service-auth/ ./
COPY database/prisma ./
RUN npx prisma generate
EXPOSE 4001
CMD ["npm", "run", "start"]
