import { IsString, MinLength } from 'class-validator';

export class CreateUserDto {
	@IsString()
	readonly username: string;

	@IsString()
	@MinLength(6)
	readonly password: string;

	@IsString()
	readonly email: string;
}