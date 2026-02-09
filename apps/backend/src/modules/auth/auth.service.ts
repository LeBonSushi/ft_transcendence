import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}

  async register(data: {
    email: string;
    password: string;
    username: string;
    firstName?: string;
    lastName?: string;
  }) {
    // Vérifie si l'email existe déjà
    const existingEmail = await this.prisma.user.findUnique({
      where: { email: data.email },
    });
    if (existingEmail) {
      throw new ConflictException('Cet email est déjà utilisé');
    }

    // Vérifie si le username existe déjà
    const existingUsername = await this.prisma.user.findUnique({
      where: { username: data.username },
    });
    if (existingUsername) {
      throw new ConflictException('Ce nom d\'utilisateur est déjà pris');
    }

    // Hash du mot de passe
    const passwordHash = await bcrypt.hash(data.password, 10);

    // Création de l'utilisateur avec son profil
    const user = await this.prisma.user.create({
      data: {
        id: randomUUID(),
        email: data.email,
        username: data.username,
        passwordHash,
        profile: {
          create: {
            firstName: data.firstName || '',
            lastName: data.lastName || '',
          },
        },
      },
      include: { profile: true },
    });

    return {
      id: user.id,
      email: user.email,
      username: user.username,
      createdAt: user.createdAt,
      profile: user.profile ? {
        firstName: user.profile.firstName,
        lastName: user.profile.lastName,
      } : null,
    };
  }

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
