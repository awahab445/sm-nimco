import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';

/**
 * E2E tests for the cart API.
 * Requires Redis (and database for full app init) to be running.
 * Set REDIS_ENABLED=false to use in-memory cart storage and skip Redis.
 */
describe('Cart API (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();
  }, 30000);

  afterAll(async () => {
    await app.close();
  });

  describe('POST /cart', () => {
    it('should create a cart and return cartId', () => {
      return request(app.getHttpServer())
        .post('/cart')
        .expect(201)
        .then((res) => {
          expect(res.body).toHaveProperty('cartId');
          expect(typeof res.body.cartId).toBe('string');
          expect(res.body.cartId.length).toBeGreaterThan(0);
        });
    });
  });

  describe('GET /cart/:cartId', () => {
    it('should return 404 for non-existent cart', async () => {
      await request(app.getHttpServer())
        .get('/cart/00000000-0000-0000-0000-000000000000')
        .expect(404);
    });

    it('should return cart after creation', async () => {
      const createRes = await request(app.getHttpServer())
        .post('/cart')
        .expect(201);
      const { cartId } = createRes.body;

      const getRes = await request(app.getHttpServer())
        .get(`/cart/${cartId}`)
        .expect(200);
      expect(getRes.body).toHaveProperty('id', cartId);
      expect(getRes.body).toHaveProperty('items');
      expect(Array.isArray(getRes.body.items)).toBe(true);
      expect(getRes.body).toHaveProperty('currency');
    });
  });
});
