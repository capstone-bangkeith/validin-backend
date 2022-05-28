# Bangkit Capstone C22-KY05 Cloud Computing

This project is using [Fastify](https://www.fastify.io/) as the server.

## Stack

- [Node.js](https://nodejs.org/)
- [TypeScript](https://www.typescriptlang.org/)
- [Fastify](https://www.fastify.io/)
- [Prisma](https://www.prisma.io/)
- [PostgreSQL](https://www.postgresql.org/)
- [Cloud SQL](https://cloud.google.com/sql)
- [Compute Engine](https://cloud.google.com/compute)
- [Cloud Storage](https://cloud.google.com/storage)
- [Redis](https://redis.io/)

## Development

- Run `yarn install` to install dependencies and generate node_modules.
- Run `yarn dev` to run the server.
- Visit `/documentation` route to view the Swagger Documentation. Or see [the pdf docs](/swagger.pdf).

## Routes

- `/kode-wilayah`: Get all kode wilayah, maximum 10 items per page (can be changed).

### Query

`limit`: modify the limit of items per page, default: 10. Example: `/kode-wilayah?limit=69`

`page`: navigate through the sea of kode wilayahs, default: 1. Example: `/kode-wilayah?page=3`

`kode`: filters the kode wilayah based on kode. Example: `/kode-wilayah?kode=110110`

### Path

`/kode-wilayah/{kode}`: To get specific items for kode wilayah. Example: `/kode-wilayah/110110`

## TODO

- Unit test using Jest
- Implement KTP submission endpoint
