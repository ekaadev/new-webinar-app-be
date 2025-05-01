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

  describe('GET /api/v1/users/current ', () => {
    beforeEach(async () => {
      await testService.deleteAll();

      await testService.createUser();
    });

    it('should can be success login and get current user', async () => {
      const response1 = await request(app.getHttpServer())
        .post('/api/v1/users/login')
        .send({
          email: 'test@mail.com',
          password: 'password',
        });

      logger.debug(response1.body);

      expect(response1.status).toBe(HttpStatus.OK);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(response1.body.data.access_token).toBeDefined();

      const response2 = await request(app.getHttpServer())
        .get('/api/v1/users/current')
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        .set('Authorization', `Bearer ${response1.body.data.access_token}`);

      logger.debug(response2.body);

      expect(response2.status).toBe(HttpStatus.OK);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(response2.body.data.email).toBe('test@mail.com');
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(response2.body.data.name).toBe('test');
    });

    it('should can be success login but invalid get current user', async () => {
      const response1 = await request(app.getHttpServer())
        .post('/api/v1/users/login')
        .send({
          email: 'test@mail.com',
          password: 'password',
        });

      logger.debug(response1.body);

      expect(response1.status).toBe(HttpStatus.OK);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(response1.body.data.access_token).toBeDefined();

      const response2 = await request(app.getHttpServer())
        .get('/api/v1/users/current')

        .set(
          'Authorization',
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          `Bearer ${response1.body.data.access_token}salah`,
        );

      logger.debug(response2.body);

      expect(response2.status).toBe(HttpStatus.UNAUTHORIZED);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(response2.body.errors).toBeDefined();
    });
  });

  describe('PATCH /api/v1/users/current ', () => {
    beforeEach(async () => {
      await testService.deleteAll();

      await testService.createUser();
    });

    it('should can be success login and update current user(name)', async () => {
      const response1 = await request(app.getHttpServer())
        .post('/api/v1/users/login')
        .send({
          email: 'test@mail.com',
          password: 'password',
        });

      logger.debug(response1.body);

      expect(response1.status).toBe(HttpStatus.OK);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(response1.body.data.access_token).toBeDefined();

      const response2 = await request(app.getHttpServer())
        .patch('/api/v1/users/current')
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        .set('Authorization', `Bearer ${response1.body.data.access_token}`)
        .send({
          name: 'test update',
        });

      logger.debug(response2.body);

      expect(response2.status).toBe(HttpStatus.OK);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(response2.body.data.email).toBe('test@mail.com');
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(response2.body.data.name).toBe('test update');
    });

    it('should can be success login and update current user(password)', async () => {
      const response1 = await request(app.getHttpServer())
        .post('/api/v1/users/login')
        .send({
          email: 'test@mail.com',
          password: 'password',
        });

      logger.debug(response1.body);

      expect(response1.status).toBe(HttpStatus.OK);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(response1.body.data.access_token).toBeDefined();

      const response2 = await request(app.getHttpServer())
        .patch('/api/v1/users/current')
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        .set('Authorization', `Bearer ${response1.body.data.access_token}`)
        .send({
          password: 'password update',
        });

      logger.debug(response2.body);

      expect(response2.status).toBe(HttpStatus.OK);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(response2.body.data.email).toBe('test@mail.com');

      const response3 = await request(app.getHttpServer())
        .post('/api/v1/users/login')
        .send({
          email: 'test@mail.com',
          password: 'password',
        });

      logger.debug(response3.body);

      expect(response2.status).toBe(HttpStatus.OK);
    });

    it('should can be success login but invalid request', async () => {
      const response1 = await request(app.getHttpServer())
        .post('/api/v1/users/login')
        .send({
          email: 'test@mail.com',
          password: 'password',
        });

      logger.debug(response1.body);

      expect(response1.status).toBe(HttpStatus.OK);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(response1.body.data.access_token).toBeDefined();

      const response2 = await request(app.getHttpServer())
        .patch('/api/v1/users/current')
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        .set('Authorization', `Bearer ${response1.body.data.access_token}`)
        .send({
          name: '',
        });

      logger.debug(response2.body);

      expect(response2.status).toBe(HttpStatus.BAD_REQUEST);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(response2.body.errors).toBeDefined();
    });

    it('should can be success login but no auth', async () => {
      const response1 = await request(app.getHttpServer())
        .post('/api/v1/users/login')
        .send({
          email: 'test@mail.com',
          password: 'password',
        });

      logger.debug(response1.body);

      expect(response1.status).toBe(HttpStatus.OK);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(response1.body.data.access_token).toBeDefined();

      const response2 = await request(app.getHttpServer())
        .patch('/api/v1/users/current')
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        .set('Authorization', `Bearer ${response1.body.data.access_token}salah`)
        .send({
          name: 'benar',
        });

      logger.debug(response2.body);

      expect(response2.status).toBe(HttpStatus.UNAUTHORIZED);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(response2.body.errors).toBeDefined();
    });
  });

  describe('DELETE /api/v1/users/logout ', () => {
    beforeEach(async () => {
      await testService.deleteAll();

      await testService.createUser();
    });

    it('should can be success login and success logout user', async () => {
      const response1 = await request(app.getHttpServer())
        .post('/api/v1/users/login')
        .send({
          email: 'test@mail.com',
          password: 'password',
        });

      logger.debug(response1.body);

      expect(response1.status).toBe(HttpStatus.OK);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(response1.body.data.access_token).toBeDefined();

      const response2 = await request(app.getHttpServer())
        .delete('/api/v1/users/logout')
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        .set('Authorization', `Bearer ${response1.body.data.access_token}`);

      logger.debug(response2.body);

      expect(response2.status).toBe(HttpStatus.OK);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(response2.body.data).toBeTruthy();
    });

    it('should can be success login but invalid logout because no bearer', async () => {
      const response1 = await request(app.getHttpServer())
        .post('/api/v1/users/login')
        .send({
          email: 'test@mail.com',
          password: 'password',
        });

      logger.debug(response1.body);

      expect(response1.status).toBe(HttpStatus.OK);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(response1.body.data.access_token).toBeDefined();

      const response2 = await request(app.getHttpServer())
        .delete('/api/v1/users/logout')
        .set(
          'Authorization',
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          `Bearer ${response1.body.data.access_token}salah`,
        );

      logger.debug(response2.body);

      expect(response2.status).toBe(HttpStatus.UNAUTHORIZED);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(response2.body.errors).toBeDefined();
    });
  });
});
