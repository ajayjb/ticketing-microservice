FROM node:20-alpine

WORKDIR /usr/app

COPY package.json yarn.lock ./

RUN yarn install --frozen-lockfile --omit=dev

COPY  . .

CMD ["yarn", "dev"]
