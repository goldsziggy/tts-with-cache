FROM node:alpine3.10

ARG TTS_VENDOR

ARG AWS_ACCESS_KEY_ID
ARG AWS_SECRET_ACCESS_KEY

ARG REPLICA_STUDIO_CLIENT_ID
ARG REPLICA_STUDIO_CLIENT_SECRET
ARG REPLICA_STUDIO_SPEAKER_ID

ARG REDIS_HOST
ARG REDIS_PORT

# Create app directory
RUN mkdir -p /tmp/app
WORKDIR /tmp/app

# Install app dependencies
COPY package.json /tmp/app
RUN npm ci

# Bundle app source
COPY . /tmp/app
EXPOSE 3000

CMD ["npm", "start"]
