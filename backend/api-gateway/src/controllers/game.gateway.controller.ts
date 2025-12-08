import { Controller, All, Req, Res } from '@nestjs/common';
import { ProxyService } from '../services/proxy.service';

@Controller('game')
export class GameGatewayController {
	constructor(private proxy: ProxyService) {}

	@All('*')
	async handleGameRequests(@Req() req, @Res() res) {
		const path = req.url === '/' ? '' : req.url;
		const targetUrl = `http://service-game:4003/game${path}`;

		const result = await this.proxy.forwardRequest(req.method, targetUrl, req.body, req.headers);

		res.send(result);
	}
}
