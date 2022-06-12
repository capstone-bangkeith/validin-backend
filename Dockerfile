FROM node:lts as builder

WORKDIR /code

COPY . .

RUN yarn install --pure-lockfile --production=false

RUN yarn build


FROM node:lts as server

WORKDIR /code

COPY . ./

RUN yarn install --pure-lockfile --prod

COPY --from=builder /code/dist ./dist

EXPOSE 3001
