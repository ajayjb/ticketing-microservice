FROM node:22-alpine

WORKDIR /usr/app

COPY package.json .

RUN yarn install --omit=dev

COPY  . .

CMD ["npm", "run", "dev"]
