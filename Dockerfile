FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
ENV REACT_APP_API_URL=/api
CMD ["npm", "start"]
