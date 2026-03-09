import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';
import { generateSecret, generateURI, verifySync } from 'otplib';
import { randomBytes } from 'crypto';

@Injectable()
export class TwoFactorService {
    constructor(private prisma: PrismaService) {}

    // 1. Geneere un secret TOTP + l'URI pour le QR code
    async generateSecret(userId: string) {
        const user = await this.prisma.user.findUnique({
            where: {id: userId},
        });

        if (!user) {
            throw new UnauthorizedException('Utilisateur non trouvé');
        }

        // Genere un secret aleatoire
        const secret = generateSecret();

        // Creer l'uri que le qr code va encoder
        const uri = generateURI({ issuer: 'ft_transcendence', label: user.email, secret });

        // Update le secret en BDD
        await this.prisma.user.update({
            where: { id: userId },
            data: { twoFactorSecret: secret },
        });

        return {secret, uri};
    }

    // 2. Active le 2FA apres verification du premier code
    async enable(userId: string, code: string) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });
        
        if (!user || !user.twoFactorSecret) {
            throw new UnauthorizedException('2FA non initialisé');
        }
        
        // Verifie que le code entrer est correct
        const isValid = verifySync({
            token: code,
            secret: user.twoFactorSecret,
        });


        if (!isValid) {
            throw new UnauthorizedException('Code 2FA invalide');
        }

        // Genere les backup codes
        const backupCodes = Array.from({ length: 8 }, () =>
            randomBytes(4).toString('hex'),
        );

        // Active le 2FA et sauvegarde les backup codes
        await this.prisma.user.update({
            where: { id: userId },
            data: {
                twoFactorEnabled: true,
                twoFactorBackupCodes: backupCodes,
            },
        });

        return { backupCodes };
    }

    // 3. Verifie un code TOTP
    async verify(userId: string, code: string) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user || !user.twoFactorSecret) {
            throw new UnauthorizedException('2FA non activé');
        }

        // En premier, verifie comme code TOTP normal
        const isValid = verifySync({
            token: code,
            secret: user.twoFactorSecret,
        });

        if (isValid) 
            return true;

        // Sinon, verifie si c'est un backup code
        const backupIndex = user.twoFactorBackupCodes.indexOf(code);
        if (backupIndex !== -1) {
            // Supprime le backup code utiliser
            const updatedCodes = [...user.twoFactorBackupCodes];
            updatedCodes.splice(backupIndex, 1);

            await this.prisma.user.update({
                where: { id: userId },
                data: { twoFactorBackupCodes: updatedCodes },
            });

            return true;
        }

        return false;
    }

    // 4. Desactive le 2FA
    async disable(userId: string, code: string) {
        const isValid = await this.verify(userId, code);

        if (!isValid) {
            throw new UnauthorizedException('Code 2FA invalide');
        }

        await this.prisma.user.update({
        where: { id: userId },
        data: {
            twoFactorEnabled: false,
            twoFactorSecret: null,
            twoFactorBackupCodes: [],
        },
        });
    }
}