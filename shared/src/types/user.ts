export interface User {
	id: string;
	username: string;
	email: string;
	profilePictureUrl?: string;
	googleId?: string;
	githubId?: string;
	friends?: User[];
}
