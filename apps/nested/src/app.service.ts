import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  onApplicationShutdown(signal: string) {
    console.log('onApplicationShutdown', signal);
  }

  getHello(): string {
    return 'Hello World!';
  }
}
