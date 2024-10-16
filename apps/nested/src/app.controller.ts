import { Controller, Get } from '@nestjs/common';

// biome-ignore lint/style/useImportType: we inject this so we dont just need the type
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
