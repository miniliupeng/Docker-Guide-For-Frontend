# Use an official Node.js runtime as a parent image
FROM node:20-alpine

# Set the working directory in the container
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package files to leverage caching
COPY package.json pnpm-lock.yaml ./

# Install dependencies for production
RUN pnpm install --prod

# Copy the rest of the application code
COPY . .

# Expose the port the app runs on
EXPOSE 3001

# The command to run when the container starts
# Use Exec form for robustness
CMD ["node", "index.js"]
