import {
  Controller,
  Post,
  Get,
  Body,
  Res,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { Public } from '@/common/gateway';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Post('register')
  async register(
    @Body() dto: RegisterDto,
    @Res({ passthrough: true }) res: Response
  ) {
    const result = await this.authService.register(dto);

    res.cookie('auth_session', result.sessionId, {
      ...result.sessionCookie.attributes,
      path: '/',
    });

    return { user: result.user };
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response
  ) {
    const result = await this.authService.login(dto);

    res.cookie('auth_session', result.sessionId, {
      ...result.sessionCookie.attributes,
      path: '/',
    });

    return { user: result.user };
  }

  @Get('me')
  async getMe(@Req() req: Request) {
    const sessionId = req.cookies['auth_session'];
    if (!sessionId) {
      return { user: null };
    }

    try {
      const { user } = await this.authService.validateSession(sessionId);
      return { user };
    } catch {
      return { user: null };
    }
  }

  @Public()
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response
  ) {
    const sessionId = req.cookies['auth_session'];
    if (sessionId) {
      await this.authService.invalidateSession(sessionId);
    }

    res.clearCookie('auth_session');
    return { message: 'Logged out successfully' };
  }
}
