import { Controller, Delete, Post, Req, UploadedFile, UseInterceptors } from '@nestjs/common';
import { StorageService } from './storage.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { UsersService } from '../users/users.service';

@Controller('storage')
export class StorageController {
  constructor(
    private storageService: StorageService,
    private usersService: UsersService  
  ) {}

  @Post('upload/profile-picture')
  @UseInterceptors(FileInterceptor('file'))
  async uploadProfilePicture(
    @UploadedFile() file: Express.Multer.File,
    @Req() req: any
  ) {
    const url = await this.storageService.uploadImage(file, 'profile-pictures');

    await this.usersService.updateProfile(req.user.id, { profilePicture: url });

    return { url, key: `profile-picture/${file.originalname}` };
  }

  @Delete('remove/profile-picture')
  async removeProfilePicture(@Req() req: any) {
    await this.storageService.removeImage(`profile-picture/${req.user.id}`);
    await this.usersService.updateProfile(req.user.id, { profilePicture: null });
    return { success: true };
  }
}
