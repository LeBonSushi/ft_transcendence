
interface ApiResponse<T> {
	data: T;
	[key: string]: any;
}

class ApiClient {
	constructor(private readonly apiUrl: string = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080')) {}

	private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
		const url = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;


		const response = await fetch(`${this.apiUrl}/${url}`, {
			...options,
			headers: {
				'Content-Type': 'application/json',
				...options.headers,
			},
			credentials: 'include',
		});

		const data = await response.json();
		console.log(`[ApiClient] ${options.method || 'GET'} ${url} - Status: ${response.status}`, data);


		return data;
	}

	async post<T>(endpoint: string, body: any): Promise<ApiResponse<T>> {
		return this.request<T>(endpoint, {
			method: 'POST',
			body: body ? JSON.stringify(body) : undefined,
		});
	}

	async get<T>(endpoint: string): Promise<ApiResponse<T>> {
		return this.request<T>(endpoint, {
			method: 'GET',
		});
	}

	async put<T>(endpoint: string, body: any): Promise<ApiResponse<T>> {
		return this.request<T>(endpoint, {
			method: 'PUT',
			body: JSON.stringify(body),
		});
	}

	async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
		return this.request<T>(endpoint, {
			method: 'DELETE',
		});
	}

	async patch<T>(endpoint: string, body: any): Promise<ApiResponse<T>> {
		return this.request<T>(endpoint, {
			method: 'PATCH',
			body: JSON.stringify(body),
		});
	}

	async head<T>(endpoint: string): Promise<ApiResponse<T>> {
		return this.request<T>(endpoint, {
			method: 'HEAD',
		});
	}

	async options<T>(endpoint: string): Promise<ApiResponse<T>> {
		return this.request<T>(endpoint, {
			method: 'OPTIONS',
		});
	}

	async trace<T>(endpoint: string): Promise<ApiResponse<T>> {
		return this.request<T>(endpoint, {
			method: 'TRACE',
		});
	}

}

export const apiClient = new ApiClient();