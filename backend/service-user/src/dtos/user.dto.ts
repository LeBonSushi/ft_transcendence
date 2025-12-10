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
	avatar?: string;

	@IsOptional()
	@IsString()
	@MinLength(11)
	password?: string;

	@IsOptional()
	@IsString()
	bio?: string;
}