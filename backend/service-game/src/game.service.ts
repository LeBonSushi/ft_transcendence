import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { RegisterDto } from './dtos/user.dto';
import * as bcrypt from 'bcrypt'

@Injectable()
export class GameService {
	constructor(private prisma: PrismaService) {}
}
