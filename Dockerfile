FROM node:13.10

WORKDIR /usr/src/app

COPY package*.json .

RUN yarn

COPY . .

EXPOSE 3000

CMD ["node", "src/index.js"]
