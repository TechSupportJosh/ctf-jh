# Based off https://cli.vuejs.org/guide/deployment.html#docker-nginx

# Build application
FROM node:16 as build-stage
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY ./ .
RUN npm run build


# Use nginx to serve the files after build
FROM nginx as production-stage
RUN mkdir /app

EXPOSE 80 443

# Copy everything from the /dist folder
COPY --from=build-stage /app/dist /app
COPY nginx.conf /etc/nginx/nginx.conf