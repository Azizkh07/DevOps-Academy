# ================================
# DevOps Academy - Frontend Dockerfile
# Multi-stage build with Nginx
# ================================

# Stage 1: Build Stage
FROM node:18-alpine AS builder

LABEL maintainer="DevOps Academy <admin@devopsacademy.com>"
LABEL description="Frontend React App for DevOps Academy Learning Platform"

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies with legacy peer deps to handle version conflicts
RUN npm ci --legacy-peer-deps && \
    npm cache clean --force

# Copy source code
COPY . .

# Build argument for API URL - Changed to port 5002
ARG REACT_APP_API_URL=http://localhost:5002
ENV REACT_APP_API_URL=$REACT_APP_API_URL

# Build React app
RUN npm run build

# Stage 2: Production with Nginx
FROM nginx:alpine

# Install curl for health checks
RUN apk add --no-cache curl

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built files from builder
COPY --from=builder /app/build /usr/share/nginx/html

# Copy assets
COPY --from=builder /app/public/assets /usr/share/nginx/html/assets
COPY --from=builder /app/public/logoo.png /usr/share/nginx/html/
COPY --from=builder /app/public/logoo.ico /usr/share/nginx/html/

# Note: nginx user already exists in nginx:alpine base image

# Expose port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -f http://localhost/health || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
