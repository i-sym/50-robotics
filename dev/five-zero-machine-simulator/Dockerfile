
FROM node:18-alpine

WORKDIR /app

# Install build dependencies for node-snap7
RUN apk add --no-cache python3 make g++ 

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build TypeScript code
RUN npm run build

# Expose S7 and HTTP ports
EXPOSE 102 8099

# Run the simulator
CMD ["node", "dist/index.js"]