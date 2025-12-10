import { Controller, All, Req, Res } from '@nestjs/common';
import { ProxyService } from '../services/proxy.service';

@Controller('user')
export class UserGatewayController {
	constructor(private proxy: ProxyService) {}

	@All('*path')
	async handleUserRequests(@Req() req, @Res() res) {
		// Nouvelle syntaxe path-to-regexp : récupère le wildcard via params.path
		const path = req.params?.path || '';
		const targetUrl = `http://service-user:4004/user/${path}`;

		const result = await this.proxy.forwardRequest(req.method, targetUrl, req.body, req.headers);
		res.status(result.status).json(result.data);
	}
}
