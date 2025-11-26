import { Controller, All, Req, Res } from '@nestjs/common';
import { ProxyService } from '../services/proxy.service';

@Controller('auth')
export class AuthGatewayController {
  constructor(private proxy: ProxyService) {}

  @All('*')
  async handleAuthRequests(@Req() req, @Res() res) {
    const targetUrl = `http://localhost:3001/auth${req.url}`;

    const result = await this.proxy.forwardRequest(
      req.method,
      targetUrl,
      req.body,
      req.headers,
    );

    res.send(result);
  }
}
