FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY .npmrc ./

# Install root dependencies (ignore scripts)
RUN npm ci --ignore-scripts

# Install frontend dependencies
COPY frontend/package*.json ./frontend/
RUN cd frontend && npm ci --ignore-scripts

# Install server dependencies
COPY server/package*.json ./server/
RUN cd server && npm ci --ignore-scripts

# Copy all files
COPY . .

# Build frontend
RUN cd frontend && npm run build

# Expose port
EXPOSE 3000

# Start server
WORKDIR /app/server
CMD ["node", "server.js"]

