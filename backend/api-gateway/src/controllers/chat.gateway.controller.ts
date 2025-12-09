import { Controller, All, Req, Res } from '@nestjs/common';
import { ProxyService } from '../services/proxy.service';

@Controller('chat')
export class ChatGatewayController {
	constructor(private proxy: ProxyService) {}

	@All()
	async handleAuthRoot(@Req() req, @Res() res) {
		const targetUrl = `http://service-chat:4002/chat`;
		const result = await this.proxy.forwardRequest(req.method, targetUrl, req.body, req.headers);
		res.send(result);
	}

	@All('*')
	async handleChatRequests(@Req() req, @Res() res) {
		const path = req.url === '/' ? '' : req.url;
		const targetUrl = `http://service-chat:4002/chat${path}`;

		const result = await this.proxy.forwardRequest(req.method, targetUrl, req.body, req.headers);

		res.send(result);
	}
}
