import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-github2';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';

@Injectable()
export class GithubStrategy extends PassportStrategy(Strategy, 'github') {
  constructor(
    private config: ConfigService,
    private authService: AuthService
  ) {
    super({
      clientID: config.get('GITHUB_CLIENT_ID', 'default-client-id'),
      clientSecret: config.get('GITHUB_CLIENT_SECRET', 'default-client-secret'),
      callbackURL: config.get('GITHUB_CALLBACK_URL', 'http://localhost:3000/auth/github/callback'),
      scope: ['user:email'],
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: any): Promise<any> {
    const { displayName, emails, photos } = profile;

    const [firstName, ...lastNameParts] = (displayName || profile.username).split(' ');
    const lastName = lastNameParts.join(' ') || 'User';

    const user = await this.authService.validateOAuthUser(
      'github',
      profile.id,
      emails[0].value,
      firstName,
      lastName,
      photos[0]?.value
    );

    return user;
  }
}
