FROM nginx:stable-alpine

# Copy our nginx.conf into the container
COPY nginx.conf /etc/nginx/nginx.conf

# Create directory for SSL certs and copy them
RUN mkdir -p /etc/nginx/ssl
COPY ./certs/selfsigned.crt  /etc/nginx/ssl/selfsigned.crt
COPY ./certs/selfsigned.key  /etc/nginx/ssl/selfsigned.key