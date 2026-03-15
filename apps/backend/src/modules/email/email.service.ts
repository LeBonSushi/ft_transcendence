import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
    private transporter: nodemailer.Transporter;

    constructor(private configService: ConfigService) {
        this.transporter = nodemailer.createTransport({
            host: this.configService.get('SMTP_HOST'),
            port: this.configService.get('SMTP_PORT'),
            secure: false,
            auth: {
                user: this.configService.get('SMTP_USER'),
                pass: this.configService.get('SMTP_PASS'),
            },
        });
    }

    async sendPasswordResetEmail(to: string, token: string) {
        const frontendUrl = this.configService.get('FRONTEND_URL');
        const resetLink = `${frontendUrl}/reset-password?token=${token}`;

        await this.transporter.sendMail({
            from: this.configService.get('SMTP_FROM'),
            to,
            subject: 'Reset your password - Travel Planner',
            html: `
                <h1>Password Reset</h1>
                <p>You requested a password reset. Click the link below to choose a new password:</p>
                <a href="${resetLink}">Reset my password</a>
                <p>This link expires in 1 hour.</p>
                <p>If you didn't request this, you can safely ignore this email.</p>
            `,
        });
    }
}