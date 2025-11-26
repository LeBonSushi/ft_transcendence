import { Injectable, NestMiddleware } from '@nestjs/common';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  use(req: any, res: any, next: () => void) {
    // Exemple : log de toutes les requêtes
    console.log(`➡ Gateway: ${req.method} ${req.originalUrl}`);
    next();
  }
}
