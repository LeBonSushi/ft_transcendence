export interface LoginResponse {
	data: {
		user: {
			id: string;
			email: string;
			username: string;
		};
		accessToken: string;
		refreshToken: string;
	};
	message: string;
}

export interface RegisterResponse {
	message: string;
	user: {
		id: string;
		email: string;
		username: string;
	};
}