FROM node:18-alpine

WORK_DIR usr/app

COPY . package.json

RUN npm install

COPY . .

CMD ["npm", "run", "dev"]
