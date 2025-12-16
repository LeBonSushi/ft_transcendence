import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    private config: ConfigService,
    private authService: AuthService
  ) {
    super({
      clientID: config.get('GOOGLE_CLIENT_ID', 'default-client-id'),
      clientSecret: config.get('GOOGLE_CLIENT_SECRET', 'default-client-secret'),
      callbackURL: config.get('GOOGLE_CALLBACK_URL', 'http://localhost:3000/auth/google/callback'),
      scope: ['email', 'profile'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback
  ): Promise<any> {
    const { name, emails, photos } = profile;

    const user = await this.authService.validateOAuthUser(
      'google',
      profile.id,
      emails[0].value,
      name.givenName,
      name.familyName,
      photos[0]?.value
    );

    done(null, user);
  }
}
