import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}

  async validateUser(email: string, password: string) {
    // Récupère l'user avec son profil depuis la DB
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: { profile: true },
    });

    if (!user) {
      return null;
    }

    // Vérification du mot de passe
    if (user.passwordHash) {
      const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
      if (!isPasswordValid) {
        return null;
      }
    } else {
      // Pas de mot de passe défini (OAuth uniquement)
      return null;
    }

    // Retourne les données nécessaires pour NextAuth
    return {
      id: user.id,
      email: user.email,
      username: user.username,
      createdAt: user.createdAt,
      profile: user.profile ? {
        firstName: user.profile.firstName,
        lastName: user.profile.lastName,
        profilePicture: user.profile.profilePicture,
        bio: user.profile.bio,
      } : null,
    };
  }
}
