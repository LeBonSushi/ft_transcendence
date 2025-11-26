import { Controller, All, Req, Res } from '@nestjs/common';
import { ProxyService } from '../services/proxy.service';

@Controller('game')
export class GameGatewayController {
  constructor(private proxy: ProxyService) {}

  @All('*')
  async handleGameRequests(@Req() req, @Res() res) {
    const targetUrl = `http://localhost:3003/game${req.url}`;

    const result = await this.proxy.forwardRequest(
      req.method,
      targetUrl,
      req.body,
      req.headers,
    );

    res.send(result);
  }
}
