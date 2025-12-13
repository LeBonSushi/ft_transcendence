import { IsString, MinLength, IsEmail } from 'class-validator';



export class LoginDto {
	@IsString()
	readonly username: string;

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
