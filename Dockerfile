##########################
# Stage 1 - Build stage  #
##########################
FROM node:22-slim AS builder

# Set working directory
WORKDIR /app

# Install dependencies
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

# Copy source files
COPY tsconfig.json tsconfig.build.json ./
COPY prisma ./prisma
COPY src ./src

# Generate prisma client
RUN npx prisma generate

# Build the app
RUN yarn build

###############################
# Stage 2 - Production stage  #
###############################
FROM node:22-slim AS production

# Set environment
ENV NODE_ENV=production

# Set working directory
WORKDIR /app

# Install openssl to run prisma
RUN apt-get update -y && apt-get install -y --no-install-recommends openssl \
    && rm -rf /var/lib/apt/lists/*

# Install dependencies
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile --production && yarn cache clean

# Copy build files from builder stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

# Regenerate prisma client
RUN npx prisma generate

# Expose API port
EXPOSE 5055

# Use a non-root user for security
USER node

# Start application
CMD ["node", "dist/src/main.js"]
