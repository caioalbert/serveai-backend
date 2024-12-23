FROM node:18-alpine

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install && npm list

COPY . .

CMD ["node", "src/index.js"]
