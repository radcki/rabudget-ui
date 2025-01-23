FROM node:16.6.1
COPY ./ /app
WORKDIR /app

RUN npm install && npm run build

FROM nginx
RUN mkdir /app
COPY --from=0 /app/dist /app
COPY nginx.conf /etc/nginx/
COPY nginx.conf.template /etc/nginx/templates/
