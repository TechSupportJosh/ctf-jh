
FROM node:16 as build-stage
WORKDIR /usr/src/app
COPY package*.json ./
COPY . .
RUN npm install
RUN npm run build

FROM node:16 as production-stage

WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install --only=production
COPY --from=build-stage /usr/src/app/dist ./dist
EXPOSE 8080

ENV NODE_ENV production

CMD ["node", "./dist/index.js"]
