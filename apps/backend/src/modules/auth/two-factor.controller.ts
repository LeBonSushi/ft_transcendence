import { Controller, Post, Body, Req, UnauthorizedException } from '@nestjs/common';
import { TwoFactorService } from './two-factor.services';

@Controller('auth/2fa')
export class TwoFactorController {
    constructor(private twoFactorService: TwoFactorService) {}

    @Post('generate')
    async generate(@Req() req: any) {
        return this.twoFactorService.generateSecret(req.user.id);
    }

    @Post('enable')
    async enable(@Req() req: any, @Body() body: { code: string }) {
        return this.twoFactorService.enable(req.user.id, body.code);
    }

    @Post('verify')
    async verify(@Req() req: any, @Body() body: { code: string }) {
        const isValid = await this.twoFactorService.verify(req.user.id, body.code);
        if (!isValid) {
            throw new UnauthorizedException('Code 2FA invalide');
        }
        return { success: true };
    }

    @Post('disable')
    async disable(@Req() req: any, @Body() body: { code: string }) {
        await this.twoFactorService.disable(req.user.id, body.code);
        return { success: true };
    }
}
