import { Controller, All, Req, Res } from '@nestjs/common';
import { ProxyService } from '../services/proxy.service';

@Controller('user')
export class UserGatewayController {
	constructor(private proxy: ProxyService) {}

	@All('*')
	async handleUserRequests(@Req() req, @Res() res) {
		const path = req.url === '/' ? '' : req.url;
		const targetUrl = `http://service-user:4004${path}`;
			
		const result = await this.proxy.forwardRequest(req.method, targetUrl, req.body, req.headers);
		res.send(result);
	}
}
