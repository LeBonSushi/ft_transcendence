import { Google, GitHub } from 'arctic';

export const google = new Google(
  process.env.GOOGLE_CLIENT_ID!,
  process.env.GOOGLE_CLIENT_SECRET!,
  process.env.GOOGLE_REDIRECT_URI || 'http://localhost:4000/api/auth/google/callback'
);

export const github = new GitHub(
  process.env.GITHUB_CLIENT_ID!,
  process.env.GITHUB_CLIENT_SECRET!,
  process.env.GITHUB_REDIRECT_URI || 'http://localhost:4000/api/auth/github/callback'
);

// Note: Arctic doesn't have built-in support for 42, you'll need to use a generic OAuth2 provider
// or keep using passport for 42 only
export class FortyTwo {
  constructor(
    private clientId: string,
    private clientSecret: string,
    private redirectUri: string
  ) {}

  async createAuthorizationURL(state: string): Promise<URL> {
    const url = new URL('https://api.intra.42.fr/oauth/authorize');
    url.searchParams.set('client_id', this.clientId);
    url.searchParams.set('redirect_uri', this.redirectUri);
    url.searchParams.set('response_type', 'code');
    url.searchParams.set('state', state);
    return url;
  }

  async validateAuthorizationCode(code: string): Promise<FortyTwoTokens> {
    const response = await fetch('https://api.intra.42.fr/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: this.clientId,
        client_secret: this.clientSecret,
        code,
        redirect_uri: this.redirectUri,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to validate authorization code');
    }

    const tokens = await response.json();
    return tokens;
  }
}

export const fortyTwo = new FortyTwo(
  process.env.FORTY_TWO_CLIENT_ID!,
  process.env.FORTY_TWO_CLIENT_SECRET!,
  process.env.FORTY_TWO_CALLBACK_URL || 'http://localhost:4000/api/auth/42/callback'
);

interface FortyTwoTokens {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token: string;
  scope: string;
  created_at: number;
}
