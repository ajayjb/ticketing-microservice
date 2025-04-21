FROM node:20-alpine

WORKDIR /usr/app

COPY package.json .

RUN yarn install --omit=dev

COPY  . .

CMD ["npm", "run", "dev"]
