import { Controller, Get } from '@nestjs/common';
import {
  HealthCheckService,
  HttpHealthIndicator,
  HealthCheck,
} from '@nestjs/terminus';

@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private http: HttpHealthIndicator,
  ) { }

  @Get()
  @HealthCheck()
  check() {
    const url = `http://localhost:${process.env.PORT || 3000}`;
    return this.health.check([
      () => this.http.pingCheck('localhost', url),
    ]);
  }
}
