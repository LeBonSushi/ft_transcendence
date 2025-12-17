import {
  Controller,
  Get,
  Req,
  Res,
  Query,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { google, github, fortyTwo } from '@/lib/oauth';
import { AuthService } from './auth.service';
import { generateState, generateCodeVerifier } from 'arctic';
import { Public } from '@/common/gateway';

@Controller('auth')
export class OAuthController {
  constructor(private authService: AuthService) {}

  // Google OAuth
  @Public()
  @Get('google')
  async googleLogin(@Res() res: Response) {
    const state = generateState();
    const codeVerifier = generateCodeVerifier();
    const url = await google.createAuthorizationURL(state, codeVerifier, ['profile', 'email']);

    res.cookie('oauth_state', state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 10 * 60 * 1000, // 10 minutes
      path: '/',
    });

    res.cookie('oauth_code_verifier', codeVerifier, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 10 * 60 * 1000,
      path: '/',
    });

    res.redirect(url.toString());
  }

  @Public()
  @Get('google/callback')
  async googleCallback(
    @Query('code') code: string,
    @Query('state') state: string,
    @Req() req: Request,
    @Res() res: Response
  ) {
    const storedState = req.cookies['oauth_state'];
    const codeVerifier = req.cookies['oauth_code_verifier'];

    if (!code || !state || !storedState || !codeVerifier || state !== storedState) {
      throw new HttpException('Invalid state', HttpStatus.BAD_REQUEST);
    }

    try {
      const tokens = await google.validateAuthorizationCode(code, codeVerifier);
      const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: {
          Authorization: `Bearer ${tokens.accessToken()}`,
        },
      });

      const googleUser = await response.json();

      const user = await this.authService.getOrCreateOAuthUser(
        'google',
        googleUser.id,
        googleUser.email,
        googleUser.given_name || '',
        googleUser.family_name || '',
        googleUser.picture
      );

      const { session, sessionCookie } = await this.authService.createSessionForUser(user.id);

      res.cookie('auth_session', session.id, {
        ...sessionCookie.attributes,
        path: '/',
      });

      res.clearCookie('oauth_state');
      res.clearCookie('oauth_code_verifier');

      res.redirect(process.env.LOGIN_REDIRECT || 'http://localhost:3000');
    } catch (error) {
      console.error('Google OAuth error:', error);
      throw new HttpException('Authentication failed', HttpStatus.UNAUTHORIZED);
    }
  }

  // GitHub OAuth
  @Public()
  @Get('github')
  async githubLogin(@Res() res: Response) {
    const state = generateState();
    const url = await github.createAuthorizationURL(state, ['user:email']);

    res.cookie('oauth_state', state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 10 * 60 * 1000,
      path: '/',
    });

    res.redirect(url.toString());
  }

  @Public()
  @Get('github/callback')
  async githubCallback(
    @Query('code') code: string,
    @Query('state') state: string,
    @Req() req: Request,
    @Res() res: Response
  ) {
    const storedState = req.cookies['oauth_state'];

    if (!code || !state || !storedState || state !== storedState) {
      throw new HttpException('Invalid state', HttpStatus.BAD_REQUEST);
    }

    try {
      const tokens = await github.validateAuthorizationCode(code);

      const userResponse = await fetch('https://api.github.com/user', {
        headers: {
          Authorization: `Bearer ${tokens.accessToken()}`,
        },
      });
      const githubUser = await userResponse.json();

      // Get primary email
      const emailResponse = await fetch('https://api.github.com/user/emails', {
        headers: {
          Authorization: `Bearer ${tokens.accessToken()}`,
        },
      });
      const emails = await emailResponse.json();
      const primaryEmail = emails.find((e: any) => e.primary)?.email || emails[0]?.email;

      const nameParts = githubUser.name?.split(' ') || ['', ''];
      const user = await this.authService.getOrCreateOAuthUser(
        'github',
        githubUser.id.toString(),
        primaryEmail,
        nameParts[0],
        nameParts.slice(1).join(' '),
        githubUser.avatar_url
      );

      const { session, sessionCookie } = await this.authService.createSessionForUser(user.id);

      res.cookie('auth_session', session.id, {
        ...sessionCookie.attributes,
        path: '/',
      });

      res.clearCookie('oauth_state');
      res.redirect(process.env.LOGIN_REDIRECT || 'http://localhost:3000');
    } catch (error) {
      console.error('GitHub OAuth error:', error);
      throw new HttpException('Authentication failed', HttpStatus.UNAUTHORIZED);
    }
  }

  // 42 OAuth
  @Public()
  @Get('42')
  async fortyTwoLogin(@Res() res: Response) {
    const state = generateState();
    const url = await fortyTwo.createAuthorizationURL(state);

    res.cookie('oauth_state', state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 10 * 60 * 1000,
      path: '/',
    });

    res.redirect(url.toString());
  }

  @Public()
  @Get('42/callback')
  async fortyTwoCallback(
    @Query('code') code: string,
    @Query('state') state: string,
    @Req() req: Request,
    @Res() res: Response
  ) {
    const storedState = req.cookies['oauth_state'];

    if (!code || !state || !storedState || state !== storedState) {
      throw new HttpException('Invalid state', HttpStatus.BAD_REQUEST);
    }

    try {
      const tokens = await fortyTwo.validateAuthorizationCode(code);

      const userResponse = await fetch('https://api.intra.42.fr/v2/me', {
        headers: {
          Authorization: `Bearer ${tokens.access_token}`,
        },
      });
      const fortyTwoUser = await userResponse.json();

      const user = await this.authService.getOrCreateOAuthUser(
        '42',
        fortyTwoUser.id.toString(),
        fortyTwoUser.email,
        fortyTwoUser.first_name,
        fortyTwoUser.last_name,
        fortyTwoUser.image?.link
      );

      const { session, sessionCookie } = await this.authService.createSessionForUser(user.id);

      res.cookie('auth_session', session.id, {
        ...sessionCookie.attributes,
        path: '/',
      });

      res.clearCookie('oauth_state');
      res.redirect(process.env.LOGIN_REDIRECT || 'http://localhost:3000');
    } catch (error) {
      console.error('42 OAuth error:', error);
      throw new HttpException('Authentication failed', HttpStatus.UNAUTHORIZED);
    }
  }
}
