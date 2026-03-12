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
	@MinLength(1)
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
	profilePicture?: string | null;

	@IsOptional()
	@IsString()
	@MinLength(10)
	password?: string;
}

export interface PublicUserResponse {
  id: string;
  username: string;
  profile: {
	firstName: string | null;
	lastName: string | null;
	profilePicture: string | null;
  } | null;
}