FROM node:18-slim

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the code
COPY . .

# Expose port (3000 for website, 3001 for fileserver - docker-compose handles this)
EXPOSE 3000

# Command is overridden in docker-compose.yml
CMD ["npm", "start"]