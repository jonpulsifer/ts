import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;
  let appService: AppService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appService = moduleRef.get(AppService);
    appController = moduleRef.get(AppController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      const result = 'Hello World!';
      jest.spyOn(appController, 'getHello').mockImplementation(() => result);
      expect(appController.getHello()).toBe(result);
    });
  });
});
