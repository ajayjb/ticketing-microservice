# Build stage
FROM node:22-alpine as builder

WORKDIR /usr/app

COPY package.json yarn.lock ./

RUN yarn install --frozen-lockfile

COPY . .

RUN yarn build

# Production stage
FROM node:22-alpine

WORKDIR /usr/app

COPY package.json yarn.lock ./

RUN yarn install --frozen-lockfile --omit=dev

COPY --from=builder /usr/app/dist ./dist

CMD ["yarn", "start"]