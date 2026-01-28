import {
  Controller,
  Post,
  Body,
  Headers,
  HttpCode,
  HttpStatus,
  Logger,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { Webhook } from 'svix';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import { Public } from '@/common/decorators/public.decorator';

interface ClerkUserData {
  id: string;
  email_addresses?: Array<{ email_address: string }>;
  username?: string;
  first_name?: string;
  last_name?: string;
  image_url?: string;
}

interface ClerkWebhookEvent {
  type: string;
  data: ClerkUserData;
}

@Controller('webhooks')
export class WebhooksController {
  private readonly logger = new Logger(WebhooksController.name);

  constructor(
    private configService: ConfigService,
    private usersService: UsersService,
  ) {}

  @Public()
  @Post('clerk')
  @HttpCode(HttpStatus.OK)
  async handleClerkWebhook(
    @Body() payload: any,
    @Headers('svix-id') svixId: string,
    @Headers('svix-timestamp') svixTimestamp: string,
    @Headers('svix-signature') svixSignature: string,
  ) {
    const webhookSecret = this.configService.get<string>('CLERK_WEBHOOK_SECRET');

    if (!webhookSecret) {
      this.logger.error('CLERK_WEBHOOK_SECRET is not configured');
      throw new InternalServerErrorException('Webhook configuration error');
    }

    if (!svixId || !svixTimestamp || !svixSignature) {
      throw new BadRequestException('Missing webhook headers');
    }

    const wh = new Webhook(webhookSecret);
    let evt: ClerkWebhookEvent;

    try {
      evt = wh.verify(JSON.stringify(payload), {
        'svix-id': svixId,
        'svix-timestamp': svixTimestamp,
        'svix-signature': svixSignature,
      }) as ClerkWebhookEvent;
    } catch (err) {
      this.logger.error('Webhook signature verification failed', err);
      throw new BadRequestException('Invalid webhook signature');
    }

    const { type, data } = evt;
    this.logger.log(`Received Clerk webhook: ${type}`);

    try {
      switch (type) {
        case 'user.created':
          await this.handleUserCreated(data);
          break;
        case 'user.updated':
          await this.handleUserUpdated(data);
          break;
        case 'user.deleted':
          await this.handleUserDeleted(data);
          break;
        default:
          this.logger.warn(`Unhandled webhook event type: ${type}`);
      }
    } catch (error: any) {
      this.logger.error(`Failed to process webhook ${type}: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to process webhook');
    }

    return { received: true };
  }

  private extractUserData(data: ClerkUserData) {
    const email = data.email_addresses?.[0]?.email_address;
    const username = data.username || email;

    if (!email || !username) {
      throw new BadRequestException('Missing email or username in webhook data');
    }

    return {
      clerkId: data.id,
      email,
      username,
      firstName: data.first_name,
      lastName: data.last_name,
      profilePicture: data.image_url,
    };
  }

  private async handleUserCreated(data: ClerkUserData) {
    this.logger.log(`Creating user from Clerk: ${data.id}`);

    const userData = this.extractUserData(data);
    await this.usersService.createFromClerk(userData);

    this.logger.log(`User created successfully: ${data.id}`);
  }

  private async handleUserUpdated(data: ClerkUserData) {
    this.logger.log(`Updating user from Clerk: ${data.id}`);

    const { clerkId, ...updateData } = this.extractUserData(data);
    await this.usersService.updateFromClerk(clerkId, updateData);

    this.logger.log(`User updated successfully: ${data.id}`);
  }

  private async handleUserDeleted(data: ClerkUserData) {
    this.logger.log(`Deleting user from Clerk: ${data.id}`);

    await this.usersService.deleteByClerkId(data.id);

    this.logger.log(`User deleted successfully: ${data.id}`);
  }
}
