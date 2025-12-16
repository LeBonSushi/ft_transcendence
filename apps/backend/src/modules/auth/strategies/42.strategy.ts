import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-42';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';

@Injectable()
export class FortyTwoStrategy extends PassportStrategy(Strategy, '42') {
  constructor(
    private config: ConfigService,
    private authService: AuthService
  ) {
    super({
      clientID: config.get('FORTY_TWO_CLIENT_ID', 'default-client-id'),
      clientSecret: config.get('FORTY_TWO_CLIENT_SECRET', 'default-client-secret'),
      callbackURL: config.get('FORTY_TWO_CALLBACK_URL', 'http://localhost:3000/auth/42/callback'),
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: any): Promise<any> {
    const { name, emails, photos } = profile;

    const user = await this.authService.validateOAuthUser(
      '42',
      profile.id,
      emails[0].value,
      name.givenName || profile.username,
      name.familyName || 'Student',
      photos[0]?.value
    );

    return user;
  }
}
