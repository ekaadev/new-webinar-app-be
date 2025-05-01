import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { Logger } from 'winston';
import { TestService } from './test.service';
import { TestModule } from './test.module';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';

describe('User Controller', () => {
  let app: INestApplication<App>;
  let logger: Logger;
  let testService: TestService;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule, TestModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    logger = app.get(WINSTON_MODULE_NEST_PROVIDER);
    testService = app.get(TestService);
  });

  describe('POST /api/v1/users/register ', () => {
    beforeEach(async () => {
      await testService.deleteAll();
    });

    it('should can be success register', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/users/register')
        .send({
          email: 'test@mail.com',
          password: 'password',
          name: 'test',
        });

      logger.debug(response.body);

      expect(response.status).toBe(HttpStatus.CREATED);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(response.body.data.access_token).toBeDefined();
    });

    it('should can be rejected register if the request is invalid', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/users/register')
        .send({
          email: '',
          password: '',
          name: 'te',
        });

      logger.debug(response.body);

      expect(response.status).toBe(HttpStatus.BAD_REQUEST);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(response.body.errors).toBeDefined();
    });

    it('should can be rejected register if user is registered', async () => {
      await testService.createUser();
      const response = await request(app.getHttpServer())
        .post('/api/v1/users/register')
        .send({
          email: 'test@mail.com',
          password: 'password',
          name: 'test',
        });

      logger.debug(response.body);

      expect(response.status).toBe(HttpStatus.BAD_REQUEST);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(response.body.errors).toBeDefined();
    });
  });

  describe('POST /api/v1/users/login ', () => {
    beforeEach(async () => {
      await testService.deleteAll();

      await testService.createUser();
    });

    it('should can be success login', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/users/login')
        .send({
          email: 'test@mail.com',
          password: 'password',
        });

      logger.debug(response.body);

      expect(response.status).toBe(HttpStatus.OK);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(response.body.data.access_token).toBeDefined();
    });

    it('should can be rejected login if the request is invalid', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/users/login')
        .send({
          email: '',
          password: '',
        });

      logger.debug(response.body);

      expect(response.status).toBe(HttpStatus.BAD_REQUEST);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(response.body.errors).toBeDefined();
    });

    it('should can be rejected login if user is wrong email or password', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/users/login')
        .send({
          email: 'test@mail.com',
          password: 'salah',
        });

      logger.debug(response.body);

      expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(response.body.errors).toBeDefined();
    });
  });
});
