import { Controller, All, Req, Res } from '@nestjs/common';
import { ProxyService } from '../services/proxy.service';
import { Request } from 'express';

@Controller('auth')
export class AuthGatewayController {
	constructor(private proxy: ProxyService) {}

	@All()
	async handleAuthRoot(@Req() req, @Res() res) {
		const targetUrl = `http://service-auth:4001/auth`;
		const result = await this.proxy.forwardRequest(req.method, targetUrl, req.body, req.headers);
		res.status(result.status || 200);
		res.set(result.headers);
		res.send(result.data);
	}

	@All('*')
	async handleAuthRequests(@Req() req, @Res() res) {
		const targetUrl = `http://service-auth:4001${req.url}`;
		const result = await this.proxy.forwardRequest(req.method, targetUrl, req.body, req.headers);
		
		res.status(result.status || 200);
		res.set(result.headers);
		res.send(result.data);
	}
}
