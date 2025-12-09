FROM node:20-alpine

WORKDIR /

COPY shared/ ./shared/
COPY frontend/ ./app/

WORKDIR /app

RUN npm install 

EXPOSE 3000

CMD ["npm", "run", "dev"]