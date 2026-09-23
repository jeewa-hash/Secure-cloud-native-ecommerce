FROM node:18-alpine
WORKDIR /app
COPY Shared /shared
COPY OrderManagementService/package*.json ./
RUN npm install
COPY OrderManagementService/ .
EXPOSE 4000
CMD ["node", "index.js"]