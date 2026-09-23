# Use a lightweight Node.js base image
FROM node:18-alpine

# Set working directory inside container
WORKDIR /app

# Copy package.json and install dependencies
COPY package*.json ./
RUN npm install --production

# Copy the rest of the application code
COPY . .

# Expose the port (matches your .env PORT=4000)
EXPOSE 4000

# Start the application
CMD ["npm", "start"]
