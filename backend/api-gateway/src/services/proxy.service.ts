import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import axios, { Method, AxiosError } from 'axios';

@Injectable()
export class ProxyService {
	async forwardRequest(method: Method, url: string, data?: any, headers?: any) {
		try {
			// Filter out problematic headers that shouldn't be forwarded
			const forwardHeaders = this.filterHeaders(headers);

			console.log(`[ProxyService] Forwarding ${method} ${url}`);

			const response = await axios({
				method,
				url,
				data,
				headers: forwardHeaders,
				validateStatus: () => false, // Don't throw on any status code
			});

			return {
				status: response.status,
				data: response.data,
			};
		} catch (error) {
			console.error('[ProxyService] Error forwarding request:', error.message);
			
			if (error instanceof AxiosError && error.response) {
				throw new HttpException(
					error.response.data,
					error.response.status
				);
			}

			throw new HttpException(
				'Service unavailable',
				HttpStatus.SERVICE_UNAVAILABLE
			);
		}
	}

	private filterHeaders(headers: any): any {
		if (!headers) return {};

		// Remove headers that shouldn't be forwarded
		const headersToRemove = [
			'host',
			'connection',
			'content-length',
			'transfer-encoding',
		];

		const filtered = { ...headers };
		headersToRemove.forEach(header => {
			delete filtered[header];
			delete filtered[header.toLowerCase()];
		});

		return filtered;
	}
}
