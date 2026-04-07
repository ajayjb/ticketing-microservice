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

COPY --from=builder /usr/app/.next ./.next
COPY --from=builder /usr/app/public ./public

CMD ["yarn", "start"]
