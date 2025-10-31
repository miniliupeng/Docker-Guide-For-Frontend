# Stage 1: The "Builder" stage - Optimized for Caching
FROM node:20-alpine AS builder
WORKDIR /app
RUN npm install -g pnpm

# First, only copy the lockfile to leverage caching
COPY pnpm-lock.yaml ./
# Fetch all dependencies based on the lockfile. This layer is only invalidated when pnpm-lock.yaml changes.
RUN pnpm fetch

# Copy package.json. This allows pnpm to create the workspace, etc.
COPY package.json .
# Install dependencies using the fetched packages (offline). This is very fast.
RUN pnpm install --offline

# Copy the rest of the application code
COPY . .

# Build the application for production
RUN pnpm run build

# Stage 2: Serve the application
# Use a lightweight web server to serve the static files
FROM node:20-alpine

WORKDIR /app

# Globally install a static file server
RUN npm install -g serve

# Copy the build output from the builder stage
COPY --from=builder /app/dist ./dist

# Expose the port the app runs on
EXPOSE 3000

# The command to run when the container starts
CMD ["serve", "-s", "dist"]
