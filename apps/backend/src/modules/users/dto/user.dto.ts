import { IsString, MinLength, IsEmail, IsNumber, IsOptional } from 'class-validator';

export class GetUserDto {
	@IsString()
	readonly username: string;

	@IsNumber()
	readonly id: number;
}

export class UpdateUserDto {
	@IsOptional()
	@IsString()
	@MinLength(3)
	username?: string;

	@IsOptional()
	@IsEmail()
	email?: string;

	@IsOptional()
	@IsString()
	firstName?: string;

	@IsOptional()
	@IsString()
	lastName?: string;

	@IsOptional()
	@IsString()
	profilePicture?: string;

	@IsOptional()
	@IsString()
	@MinLength(10)
	passwordHash?: string;

	@IsOptional()
	@IsString()
	bio?: string;

	@IsOptional()
	@IsString()
	location?: string;

	@IsOptional()
	@IsString()
	birthdate?: string;
}


export interface CreateFromClerkDto {
  clerkId: string;
  email: string;
  username: string;
  firstName?: string;
  lastName?: string;
  profilePicture?: string;
}

export interface UpdateFromClerkDto {
  email: string;
  username: string;
  firstName?: string;
  lastName?: string;
  profilePicture?: string;
}

export interface PublicUserResponse {
  id: string;
  username: string;
  profile: {
	firstName: string | null;
	lastName: string | null;
	profilePicture: string | null;
	bio: string | null;
  } | null;
}