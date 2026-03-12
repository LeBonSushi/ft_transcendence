import { Injectable, ConflictException, Inject, forwardRef } from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import { verifySync } from 'otplib';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationTemplates } from '../notifications/templates/templates';
import { NotificationType } from '@travel-planner/shared';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    @Inject (forwardRef(() => NotificationsService))
    private notificationsService : NotificationsService
  ) {}

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
      select: {
        id: true,
        email: true,
        username: true,
        createdAt: true,
        profile: true,
      },
    });

    await this.notificationsService.createNotification(NotificationTemplates.getTemplate(NotificationType.WELCOME_MSG, {toUserId : user.id, firstName : user.profile?.firstName}))
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

  async validateUser(email: string, password: string, totpCode?: string) {
    // Récupère l'user avec son profil depuis la DB
    const user = await this.prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        username: true,
        createdAt: true,
        passwordHash: true,
        twoFactorEnabled: true,
        twoFactorSecret: true,
        twoFactorBackupCodes: true,
        profile: true,
      },
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

    // Si le 2FA est activer, on doit verifier le code TOTP
    if (user.twoFactorEnabled) {
      // Si pas code fourni, on dit au front qu'il faut le 2FA
      if (!totpCode) {
        return { requiresTwoFactor: true, userId: user.id };
      }

      // si le code est fourni, on le verifie
      let isValidTotp = false;

      if (totpCode.length === 6) {
        const result = verifySync({ token: totpCode, secret: user.twoFactorSecret! });
        isValidTotp = result.valid === true;
      }
      // const result = verifySync({ token: totpCode, secret: user.twoFactorSecret! });
      // const isValidTotp = result.valid === true;

      // Verifier aussi les backup codes
      if (!isValidTotp) {
        const backupIndex = user.twoFactorBackupCodes.indexOf(totpCode);
        if (backupIndex === -1) {
          return null;
        }

        // Supprimer le backup code utilisé
        const updatedCodes = [...user.twoFactorBackupCodes];
        updatedCodes.splice(backupIndex, 1);
        await this.prisma.user.update({
          where: {id: user.id},
          data: {twoFactorBackupCodes: updatedCodes },
        });
      }
    }

    // Retourne les données nécessaires pour NextAuth
    return {
      id: user.id,
      email: user.email,
      username: user.username,
      createdAt: user.createdAt,
      twoFactorEnabled: user.twoFactorEnabled,
      profile: user.profile ? {
        firstName: user.profile.firstName,
        lastName: user.profile.lastName,
        profilePicture: user.profile.profilePicture,
      } : null,
    };
  }
}
