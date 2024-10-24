import { Controller, Get } from '@nestjs/common';
// biome-ignore lint/style/useImportType: we inject these so we dont just need the types
import {
  HealthCheck,
  HealthCheckService,
  HttpHealthIndicator,
} from '@nestjs/terminus';

@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private http: HttpHealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  check() {
    const url = `http://localhost:${process.env.PORT ?? '3000'}`;
    return this.health.check([() => this.http.pingCheck('localhost', url)]);
  }
}
