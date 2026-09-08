FROM node:24.15.0-slim
WORKDIR /src
COPY . .
RUN npm install
RUN npm run build
EXPOSE 4200
ENTRYPOINT ["npm", "run", "start"]
