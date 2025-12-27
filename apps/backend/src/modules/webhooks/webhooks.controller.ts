import { Controller, Post, Body, Headers, HttpCode, HttpStatus, Logger } from '@nestjs/common';
import { Webhook } from 'svix';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import { Public } from '@/common/decorators/public.decorator';

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
      throw new Error('Webhook secret not configured');
    }

    const wh = new Webhook(webhookSecret);
    let evt: any;

    try {
      evt = wh.verify(JSON.stringify(payload), {
        'svix-id': svixId,
        'svix-timestamp': svixTimestamp,
        'svix-signature': svixSignature,
      });
    } catch (err) {
      this.logger.error('Webhook signature verification failed', err);
      throw new Error('Invalid webhook signature');
    }

    // Gérer les événements Clerk
    const { type, data } = evt;
    this.logger.log(`Received Clerk webhook: ${type}`);

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

    return { received: true };
  }

  private async handleUserCreated(data: any) {
    this.logger.log(`Creating user from Clerk: ${data.id}`);

    const email = data.email_addresses?.[0]?.email_address;
    const username = data.username || data.email_addresses?.[0]?.email_address;

    if (!email || !username) {
      this.logger.error('Missing email or username in Clerk webhook data');
      return;
    }

    try {
      await this.usersService.createFromClerk({
        clerkId: data.id,
        email,
        username,
        firstName: data.first_name,
        lastName: data.last_name,
        profilePicture: data.image_url,
      });

      this.logger.log(`User created successfully: ${data.id}`);
    } catch (error) {
      this.logger.error(`Failed to create user: ${error.message}`, error.stack);
    }
  }

  private async handleUserUpdated(data: any) {
    this.logger.log(`Updating user from Clerk: ${data.id}`);

    const email = data.email_addresses?.[0]?.email_address;
    const username = data.username || data.email_addresses?.[0]?.email_address;

    if (!email || !username) {
      this.logger.error('Missing email or username in Clerk webhook data');
      return;
    }

    try {
      await this.usersService.updateFromClerk(data.id, {
        email,
        username,
        firstName: data.first_name,
        lastName: data.last_name,
        profilePicture: data.image_url,
      });

      this.logger.log(`User updated successfully: ${data.id}`);
    } catch (error) {
      this.logger.error(`Failed to update user: ${error.message}`, error.stack);
    }
  }

  private async handleUserDeleted(data: any) {
    this.logger.log(`Deleting user from Clerk: ${data.id}`);

    try {
      await this.usersService.deleteByClerkId(data.id);
      this.logger.log(`User deleted successfully: ${data.id}`);
    } catch (error) {
      this.logger.error(`Failed to delete user: ${error.message}`, error.stack);
    }
  }
}
