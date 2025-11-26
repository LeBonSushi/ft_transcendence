import { Controller, All, Req, Res } from '@nestjs/common';
import { ProxyService } from '../services/proxy.service';

@Controller('user')
export class UserGatewayController {
  constructor(private proxy: ProxyService) {}

  @All('*')
  async handleUserRequests(@Req() req, @Res() res) {
    const targetUrl = `http://localhost:3004/user${req.url}`;

    const result = await this.proxy.forwardRequest(
      req.method,
      targetUrl,
      req.body,
      req.headers,
    );

    res.send(result);
  }
}
