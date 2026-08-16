import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { ResultExceptionFilter } from './../src/common/filters/result-exception.filter';
import { ResultInterceptor } from './../src/common/interceptors/result.interceptor';

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('v1');
    app.useGlobalInterceptors(new ResultInterceptor());
    app.useGlobalFilters(new ResultExceptionFilter());
    await app.init();
  });

  it('/v1 (GET)', () => {
    return request(app.getHttpServer())
      .get('/v1')
      .expect(200)
      .expect((res) => {
        expect(res.body).toMatchObject({
          status: 200,
          isSuccess: true,
          message: ['Retrieved successfully'],
          data: 'Hello from API',
        });
      });
  });

  afterEach(async () => {
    await app.close();
  });
});
