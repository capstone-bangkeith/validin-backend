FROM node:lts as server

WORKDIR /code
COPY . /code

RUN yarn install --pure-lockfile

RUN yarn build

EXPOSE 3001
