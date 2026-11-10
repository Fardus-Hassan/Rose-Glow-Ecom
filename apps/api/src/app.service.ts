import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  health() {
    return {
      ok: true,
      service: 'rose-glow-api',
      time: new Date().toISOString(),
    };
  }
}
