interface CallType {
	GET: string;
	POST: string;
	PUT: string;
	DELETE: string;
	HEAD: string;
	OPTIONS: string;
	PATCH: string;
	CONNECT: string;
	TRACE: string;
}

const APIUrl = 'http://localhost:8080'

export async function callApi(method: keyof CallType, entryPoint: string, body?: any): Promise<any> {
	const url = APIUrl + (entryPoint.startsWith('/') ? entryPoint : "/" + entryPoint);

	try {
		const res = await fetch(url, { method, body: body ? JSON.stringify(body) : undefined, headers: { 'Content-Type': 'application/json' } });
		const data = await res.json();
		return data;
	}
	catch (error) {
		console.error("Error calling API:", error);
		return { error: 'Error calling API', details: error };
	}
}