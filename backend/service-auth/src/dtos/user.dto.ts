import { IsString, MinLength, IsEmail, isEmail } from 'class-validator';

export class LoginDto {
	@IsEmail()
	readonly email: string;

	@IsString()
	@MinLength(6)
	readonly password: string;
}

export class RegisterDto {
	@IsString()
	readonly username: string;

	@IsEmail()
	readonly email: string;

	@IsString()
	@MinLength(6)
	readonly password: string;
}
