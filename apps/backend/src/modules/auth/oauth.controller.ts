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

  /**
   * Initiates Google OAuth flow
   *
   * Redirects the user to Google's authorization page where they can select
   * their account and grant permissions. Uses PKCE for enhanced security.
   *
   * @param res - Express response object
   * @returns Redirects to Google OAuth authorization URL
   */
  @Public()
  @Get('google')
  async googleLogin(@Res() res: Response) {
    // Generate state for CSRF protection
    const state = generateState();
    // Generate code verifier for PKCE (Proof Key for Code Exchange)
    const codeVerifier = generateCodeVerifier();
    // Create the auth url to redirect the user to
    const url = google.createAuthorizationURL(state, codeVerifier, ['profile', 'email']);

    // Force account selection every time
    url.searchParams.set('prompt', 'select_account');

    // Add oauth_state cookie to validate later to know if the request came from our app
    res.cookie('oauth_state', state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 10 * 60 * 1000, // 10 minutes
      path: '/',
    });

    // Add code verifier cookie for PKCE validation
    res.cookie('oauth_code_verifier', codeVerifier, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 10 * 60 * 1000,
      path: '/',
    });

    res.redirect(url.toString());
  }

  /**
   * Handles Google OAuth callback
   *
   * Called by Google after user authorizes the application. Exchanges the
   * authorization code for an access token, fetches user info, and creates
   * or updates the user in the database.
   *
   * @param code - Authorization code from Google
   * @param state - State parameter for CSRF protection
   * @param req - Express request object
   * @param res - Express response object
   * @returns HTML script that closes popup and notifies parent window
   */
  @Public()
  @Get('google/callback')
  async googleCallback(
    @Query('code') code: string,
    @Query('state') state: string,
    @Req() req: Request,
    @Res() res: Response
  ) {
    // Validate state parameter to know if the request came from our app
    const storedState = req.cookies['oauth_state'];
    const codeVerifier = req.cookies['oauth_code_verifier'];

    if (!code || !state || !storedState || !codeVerifier || state !== storedState) {
      throw new HttpException('Invalid state', HttpStatus.BAD_REQUEST);
    }

    try {
      // Exchange authorization code for access token
      const tokens = await google.validateAuthorizationCode(code, codeVerifier);
      // Fetch user info from Google API
      const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: {
          Authorization: `Bearer ${tokens.accessToken()}`,
        },
      });

      const googleUser = await response.json();

      // Create or get user in our database
      const user = await this.authService.getOrCreateOAuthUser(
        'google',
        googleUser.id,
        googleUser.email,
        googleUser.given_name || '',
        googleUser.family_name || '',
        googleUser.picture
      );

      // Create session for the user
      const { session, sessionCookie } = await this.authService.createSessionForUser(user.id);

      // Add session cookie for remembering logged in user
      res.cookie('auth_session', session.id, {
        ...sessionCookie.attributes,
        path: '/',
      });

      // Clean up OAuth cookies
      res.clearCookie('oauth_state');
      res.clearCookie('oauth_code_verifier');

      // Send a script to close the popup and notify the opener window
      res.send(`
        <script>
          if (window.opener) {
            window.opener.postMessage({
              type: 'oauth-success',
              user: ${JSON.stringify(user)}
            }, '${process.env.CORS_ORIGIN}');
            window.close();
          } else {
            window.location.href = '${process.env.LOGIN_REDIRECT || 'http://localhost:3000'}';
          }
        </script>
      `);
    } catch (error) {
      console.error('Google OAuth error:', error);
      throw new HttpException('Authentication failed', HttpStatus.UNAUTHORIZED);
    }
  }

  /**
   * Initiates GitHub OAuth flow
   *
   * Redirects the user to GitHub's authorization page where they can select
   * their account and grant permissions to access user info and email.
   *
   * @param res - Express response object
   * @returns Redirects to GitHub OAuth authorization URL
   */
  @Public()
  @Get('github')
  async githubLogin(@Res() res: Response) {
    // Generate state for CSRF protection
    const state = generateState();
    // Create the auth url to redirect the user to
    const url = github.createAuthorizationURL(state, ['user:email']);

    // Force account selection every time
    url.searchParams.set('prompt', 'select_account');

    // Add oauth_state cookie to validate later to know if the request came from our app
    res.cookie('oauth_state', state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 10 * 60 * 1000,
      path: '/',
    });

    res.redirect(url.toString());
  }

  /**
   * Handles GitHub OAuth callback
   *
   * Called by GitHub after user authorizes the application. Exchanges the
   * authorization code for an access token, fetches user info and email,
   * and creates or updates the user in the database.
   *
   * @param code - Authorization code from GitHub
   * @param state - State parameter for CSRF protection
   * @param req - Express request object
   * @param res - Express response object
   * @returns HTML script that closes popup and notifies parent window
   */
  @Public()
  @Get('github/callback')
  async githubCallback(
    @Query('code') code: string,
    @Query('state') state: string,
    @Req() req: Request,
    @Res() res: Response
  ) {
    // Validate state parameter to know if the request came from our app
    const storedState = req.cookies['oauth_state'];

    if (!code || !state || !storedState || state !== storedState) {
      throw new HttpException('Invalid state', HttpStatus.BAD_REQUEST);
    }

    try {
      // Exchange authorization code for access token
      const tokens = await github.validateAuthorizationCode(code);

      // Fetch user info from GitHub API
      const userResponse = await fetch('https://api.github.com/user', {
        headers: {
          Authorization: `Bearer ${tokens.accessToken()}`,
        },
      });
      const githubUser = await userResponse.json();

      // Get primary email from GitHub
      const emailResponse = await fetch('https://api.github.com/user/emails', {
        headers: {
          Authorization: `Bearer ${tokens.accessToken()}`,
        },
      });
      const emails = await emailResponse.json();
      const primaryEmail = emails.find((e: any) => e.primary)?.email || emails[0]?.email;

      // Parse name into first and last name
      const nameParts = githubUser.name?.split(' ') || ['', ''];
      // Create or get user in our database
      const user = await this.authService.getOrCreateOAuthUser(
        'github',
        githubUser.id.toString(),
        primaryEmail,
        nameParts[0],
        nameParts.slice(1).join(' '),
        githubUser.avatar_url
      );

      // Create session for the user
      const { session, sessionCookie } = await this.authService.createSessionForUser(user.id);

      // Add session cookie for remembering logged in user
      res.cookie('auth_session', session.id, {
        ...sessionCookie.attributes,
        path: '/',
      });

      // Clean up OAuth cookies
      res.clearCookie('oauth_state');

      // Send a script to close the popup and notify the opener window
      res.send(`
        <script>
          if (window.opener) {
            window.opener.postMessage({
              type: 'oauth-success',
              user: ${JSON.stringify(user)}
            }, '${process.env.CORS_ORIGIN}');
            window.close();
          } else {
            window.location.href = '${process.env.LOGIN_REDIRECT || 'http://localhost:3000'}';
          }
        </script>
      `);
    } catch (error) {
      console.error('GitHub OAuth error:', error);
      throw new HttpException('Authentication failed', HttpStatus.UNAUTHORIZED);
    }
  }

  /**
   * Initiates 42 OAuth flow
   *
   * Redirects the user to 42's (École 42) authorization page where they
   * can authenticate with their 42 intranet account.
   *
   * @param res - Express response object
   * @returns Redirects to 42 OAuth authorization URL
   */
  @Public()
  @Get('42')
  async fortyTwoLogin(@Res() res: Response) {
    // Generate state for CSRF protection
    const state = generateState();
    // create the auth url to redirect the user to
    const url = await fortyTwo.createAuthorizationURL(state);

    // Add oauth_state cookie to validate later to know if the request came from our app
    res.cookie('oauth_state', state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 10 * 60 * 1000,
      path: '/',
    });

    res.redirect(url.toString());
  }

  /**
   * Handles 42 OAuth callback
   *
   * Called by 42 API after user authorizes the application. Exchanges the
   * authorization code for an access token, fetches user info from 42 intranet,
   * and creates or updates the user in the database.
   *
   * @param code - Authorization code from 42 API
   * @param state - State parameter for CSRF protection
   * @param req - Express request object
   * @param res - Express response object
   * @returns HTML script that closes popup and notifies parent window
   */
  @Public()
  @Get('42/callback')
  async fortyTwoCallback(
    @Query('code') code: string,
    @Query('state') state: string,
    @Req() req: Request,
    @Res() res: Response
  ) {
    // Validate state parameter to know if the request came from our app
    const storedState = req.cookies['oauth_state'];

    if (!code || !state || !storedState || state !== storedState) {
      console.error('State validation failed!');
      throw new HttpException('Invalid state', HttpStatus.BAD_REQUEST);
    }

    try {
      // Exchange authorization code for access token
      const tokens = await fortyTwo.validateAuthorizationCode(code);

      const userResponse = await fetch('https://api.intra.42.fr/v2/me', {
        headers: {
          Authorization: `Bearer ${tokens.access_token}`,
        },
      });
      const fortyTwoUser = await userResponse.json();

      // Create or get user in our database
      const user = await this.authService.getOrCreateOAuthUser(
        '42',
        fortyTwoUser.id.toString(),
        fortyTwoUser.email,
        fortyTwoUser.first_name,
        fortyTwoUser.last_name,
        fortyTwoUser.image?.link
      );

      const { session, sessionCookie } = await this.authService.createSessionForUser(user.id);

      // Add session cookie for remembering logged in user
      res.cookie('auth_session', session.id, {
        ...sessionCookie.attributes,
        path: '/',
      });

      res.clearCookie('oauth_state');

      // Send a script to close the popup and notify the opener window
      res.send(`
        <script>
          if (window.opener) {
            window.opener.postMessage({
              type: 'oauth-success',
              user: ${JSON.stringify(user)}
            }, '${process.env.CORS_ORIGIN}');
            window.close();
          } else {
            window.location.href = '${process.env.LOGIN_REDIRECT || 'http://localhost:3000'}';
          }
        </script>
      `);
    } catch (error) {
      console.error('42 OAuth error:', error);
      throw new HttpException('Authentication failed', HttpStatus.UNAUTHORIZED);
    }
  }
}
