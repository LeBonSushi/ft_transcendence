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

export function callApi(method: keyof CallType, entryPoint: string): any {
	const url = APIUrl + (entryPoint.startsWith('/') ? entryPoint : "/" + entryPoint);

	const res = fetch(url, { method });

	return res;
}