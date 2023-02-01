FROM node:14-alpine

WORKDIR /app

COPY package.json /app/package.json
COPY package-lock.json /app/package-lock.json
RUN npm install

COPY public /app/public

COPY src /app/src
COPY tsconfig*.json /app/

RUN npm run build

ENV NODE_ENV production

CMD ["npm", "start"]
