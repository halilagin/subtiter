# Stage 1: Build the React application
FROM node:18-alpine AS build

# Set the working directory
WORKDIR /app

# Install system dependencies required for canvas
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    jpeg-dev \
    cairo-dev \
    giflib-dev \
    pango-dev \
    libtool \
    autoconf \
    automake

# Copy package.json and package-lock.json
COPY package.json package-lock.json ./

# Install dependencies
RUN npm ci

# Copy the rest of the application code
COPY . .
RUN cp src/AppConfigDocker.ts src/AppConfig.ts

# Build the application
# Ensure your build script outputs to the 'dist' directory
RUN npm run build:docker

FROM nginx:latest


# Copy both HTTP and HTTPS configurations
COPY nginx.conf /etc/nginx/nginx.conf


# # Copy the build output from the build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Expose ports
EXPOSE 23080 23443


# Start Nginx
CMD ["nginx", "-g", "daemon off;"] 
