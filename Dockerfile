FROM node:latest
COPY ./ /app
WORKDIR /app
RUN echo "$VUE_APP_APIURL"
RUN echo "$VUE_APP_AUTH_AUTHORITY"
RUN echo "$VUE_APP_AUTH_REDIRECT_URI"
RUN echo "$VUE_APP_AUTH_POPUP_REDIRECT_URI"
RUN echo "$VUE_APP_AUTH_POST_LOGOUT_REDIRECT_URI"
RUN echo "$VUE_APP_AUTH_SILENT_REDIRECT_URI"
RUN npm install && npm run build

FROM nginx
RUN mkdir /app
COPY --from=0 /app/dist /app
COPY nginx.conf /etc/nginx/nginx.conf