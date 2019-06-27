FROM node:alpine as builder

COPY package.json package-lock.json ./

RUN npm set progress=false && npm config set depth 0 && npm cache clean --force

RUN mkdir /ng-app

## Storing node modules on a separate layer will prevent unnecessary npm installs at each build
WORKDIR /ng-app

COPY . .

RUN npm rebuild node-sass

RUN npm install --only=prod

## Build the angular app in production mode and store the artifacts in dist folder
RUN $(npm bin)/ng build --configuration=production

FROM nginx:1.15.1-alpine

COPY nginx/default.conf /etc/nginx/conf.d/

## Remove default nginx website
RUN rm -rf /usr/share/nginx/html/*

## From 'builder' stage copy over the artifacts in dist folder to default nginx public folder
COPY --from=builder /ng-app/dist/bank-fin-man/ /usr/share/nginx/html

expose 80

CMD nginx -g 'daemon off;'
