FROM node:22-alpine AS base

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN corepack enable && corepack prepare pnpm@10.24.0 --activate

WORKDIR /app

FROM base AS deps
COPY package.json pnpm-lock.yaml ./
COPY .husky ./.husky/
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --prod --frozen-lockfile

FROM base AS builder
ENV CI=true
COPY package.json pnpm-lock.yaml ./
COPY .husky ./.husky/
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
COPY . .
RUN pnpm build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

# Use node image default node user (UID/GID 1000)
# will automatically set the owner 
# to the host's user with same UID/GID
RUN chown -R node:node /app

USER node
CMD [ "node", "dist/main.js" ]
