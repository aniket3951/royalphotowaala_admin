FROM node:18-alpine

# Set working directory
WORKDIR /opt/render/project/src

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy backend files
COPY . .

# Copy frontend files (CRITICAL FIX)
COPY ../public /opt/render/project/src/public

# Create uploads directory
RUN mkdir -p uploads/gallery uploads/home uploads/logos

# Expose port
EXPOSE 10000

# Set environment variables
ENV NODE_ENV=production
ENV PORT=10000
ENV JWT_SECRET=royalphotowaala-secret-key-2024-production
ENV DATABASE_URL=file:/opt/render/project/src/database.sqlite

# Start the application
CMD ["npm", "start"]
