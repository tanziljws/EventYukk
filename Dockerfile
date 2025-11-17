FROM node:20-alpine

WORKDIR /app

# Set environment variables
ENV NODE_ENV=production
ENV NPM_CONFIG_IGNORE_SCRIPTS=true

# Copy package files first for better caching
COPY package*.json ./
COPY .npmrc ./

# Install root dependencies (ignore scripts)
RUN npm ci --ignore-scripts || true

# Install frontend dependencies
COPY frontend/package*.json ./frontend/
RUN cd frontend && npm ci --ignore-scripts || true

# Install server dependencies
COPY server/package*.json ./server/
RUN cd server && npm ci --ignore-scripts || true

# Copy all files
COPY . .

# Build frontend
RUN cd frontend && npm run build || echo "Frontend build skipped"

# Expose port (Railway will set PORT automatically)
EXPOSE 3000

# Start server
WORKDIR /app/server
CMD ["node", "server.js"]

