<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

Backend API for the e-commerce platform (NestJS). Provides products, cart, checkout, orders, payments, auth, addresses, promotions, shipping, tax, and admin endpoints. For detailed setup (database, Redis, env vars), see **SETUP.md**.

## Quick start

### Environment variables

Create a `.env` file in the backend root. Required and common variables:

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string (e.g. `postgresql://user:pass@localhost:5432/dbname`) |
| `PORT` | No | API port (default `3000`) |
| `JWT_SECRET` | Yes (auth) | Secret for signing JWT tokens; use a strong value in production |
| `JWT_EXPIRES_IN` | No | Token expiry (default `7d`) |
| `CORS_ORIGIN` | No | Allowed frontend origin (default `http://localhost:3001`) |
| `REDIS_ENABLED` | No | Set `false` to run without Redis (cart/checkout use in-memory; data lost on restart) |
| `REDIS_HOST`, `REDIS_PORT` | If Redis | Redis connection (default `localhost`, `6379`) |
| `DEFAULT_CURRENCY` | No | Default currency for carts (e.g. `USD`, `PKR`) |
| `FRONTEND_URL` | No | Frontend URL for “create account” email links (default `http://localhost:3001`) |

For Stripe payments, configure your Stripe keys in env as required by the payment module.

### Install and run

```bash
npm install
npx prisma generate
npx prisma migrate deploy
npm run start:dev
```

The API runs at `http://localhost:3000` (or `PORT`). Use the Postman collection in `postman/` to test endpoints. For full setup (seed, Redis, migrations), see **SETUP.md**.

## Project setup

```bash
$ npm install
```

## Compile and run the project

```bash
# development (single run)
$ npm run start

# watch mode (recommended for development)
$ npm run start:dev

# production mode (build then start)
$ npm run build
$ npm run start:prod
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests (requires DB and optionally Redis; see test/README.md)
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## API documentation

- **Postman:** Import `postman/Ecommerce-Platform-API.postman_collection.json`. Set `baseUrl` to your API root (e.g. `http://localhost:3000`).
- **Next steps:** See repo root **NEXT_STEPS.md** for production readiness and optional features.

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ npm install -g @nestjs/mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
