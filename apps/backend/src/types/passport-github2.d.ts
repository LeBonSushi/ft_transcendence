declare module 'passport-github2' {
  import { Strategy as PassportStrategy } from 'passport-strategy';

  export interface StrategyOptions {
    clientID: string;
    clientSecret: string;
    callbackURL: string;
    scope?: string[];
  }

  export interface Profile {
    id: string;
    username: string;
    displayName: string;
    emails: Array<{ value: string }>;
    photos: Array<{ value: string }>;
    provider: string;
    _raw: string;
    _json: any;
  }

  export type VerifyFunction = (
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: (error: any, user?: any) => void
  ) => void;

  export class Strategy extends PassportStrategy {
    constructor(options: StrategyOptions, verify: VerifyFunction);
    name: string;
  }
}
