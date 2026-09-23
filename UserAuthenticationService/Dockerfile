FROM node:18-alpine
WORKDIR /app
COPY UserAuthenticationService/package*.json ./
RUN npm install
COPY UserAuthenticationService/ .
EXPOSE 5002
CMD ["node", "src/index.js"]
