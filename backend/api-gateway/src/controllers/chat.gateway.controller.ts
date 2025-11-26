import { Controller, All, Req, Res } from '@nestjs/common';
import { ProxyService } from '../services/proxy.service';

@Controller('chat')
export class ChatGatewayController {
  constructor(private proxy: ProxyService) {}

  @All('*')
  async handleChatRequests(@Req() req, @Res() res) {
    const targetUrl = `http://localhost:3002/chat${req.url}`;

    const result = await this.proxy.forwardRequest(
      req.method,
      targetUrl,
      req.body,
      req.headers,
    );

    res.send(result);
  }
}
