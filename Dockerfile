FROM node:16.6.1
COPY ./ /app
WORKDIR /app
RUN echo "$VUE_APP_APIURL"
RUN echo "$VUE_APP_AUTH_AUTHORITY"
RUN echo "$VUE_APP_AUTH_REDIRECT_URI"
RUN echo "$VUE_APP_AUTH_POPUP_REDIRECT_URI"
RUN echo "$VUE_APP_AUTH_POST_LOGOUT_REDIRECT_URI"
RUN echo "$VUE_APP_AUTH_SILENT_REDIRECT_URI"
RUN echo "$VUE_APP_AUTH_CLIENT_ID"
RUN npm install && npm run build

FROM nginx
RUN mkdir /app
COPY --from=0 /app/dist /app
COPY nginx.conf /etc/nginx/
COPY nginx.conf.template /etc/nginx/templates/
