import { IsString, MinLength, IsEmail, IsNumber } from 'class-validator';

export class GetUserDto {
	@IsString()
	readonly username: string;

	@IsNumber()
	readonly id: number;
}