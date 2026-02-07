import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      username: string;
      createdAt: Date;
      profile?: {
        firstName: string | null;
        lastName: string | null;
        profilePicture: string | null;
        bio: string | null;
      } | null;
    } & DefaultSession["user"];
    accessToken?: string;
  }

  interface User {
    id: string;
    email: string;
    username: string;
    createdAt: Date;
    profile?: {
      firstName: string | null;
      lastName: string | null;
      profilePicture: string | null;
      bio: string | null;
    } | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    username: string;
    createdAt: string;
    profile?: {
      firstName: string | null;
      lastName: string | null;
      profilePicture: string | null;
      bio: string | null;
    } | null;
    accessToken?: string;
  }
}
