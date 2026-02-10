FROM node:20.12.1-slim
WORKDIR /src
COPY . .
RUN npm install
RUN npm run build
EXPOSE 4200
ENTRYPOINT ["npm", "run", "start"]
