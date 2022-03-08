FROM node:14-alpine

ARG NODE_ENV=production
ENV NODE_ENV $NODE_ENV

WORKDIR /app

COPY package.json /app/package.json
RUN npm install

COPY public /app/public

COPY src /app/src
COPY tsconfig*.json /app/
COPY rollup.config.js /app/

RUN npm run build

CMD ["npm", "start"]
