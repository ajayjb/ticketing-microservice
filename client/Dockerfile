# Build stage
FROM node:22-alpine AS builder

ARG NEXT_PUBLIC_ENVIRONMENT
ARG NEXT_PUBLIC_DOMAIN
ARG NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY

ENV NEXT_TELEMETRY_DISABLED=1 \
    NEXT_PUBLIC_ENVIRONMENT=$NEXT_PUBLIC_ENVIRONMENT \
    NEXT_PUBLIC_DOMAIN=$NEXT_PUBLIC_DOMAIN \
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=$NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY

WORKDIR /usr/app

COPY package.json yarn.lock ./

RUN yarn install --frozen-lockfile

COPY . .

RUN yarn build

# Production stage
FROM node:22-alpine AS runner

WORKDIR /usr/app

COPY package.json yarn.lock ./

RUN yarn install --frozen-lockfile --omit=dev

COPY --from=builder /usr/app/.next ./.next
COPY --from=builder /usr/app/public ./public

CMD ["yarn", "start"]
