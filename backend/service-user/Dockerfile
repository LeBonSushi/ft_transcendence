FROM node:20-alpine
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install
COPY . .
COPY ../../shared ./shared
EXPOSE 3003
CMD ["npm", "run", "start"]
