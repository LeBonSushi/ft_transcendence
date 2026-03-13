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

    await this.usersService.modifyUser(req.user.id, { profilePicture: url });

    return { url, key: `profile-picture/${file.originalname}` };
  }

  @Post('upload/room-image')
  @UseInterceptors(FileInterceptor('file'))
  async uploadRoomImage(@UploadedFile() file: Express.Multer.File) {
    const url = await this.storageService.uploadImage(file, 'room-images');
    return { url, key: `room-images/${file.originalname}` };
  }

  @Post('upload/message-attachment')
  @UseInterceptors(FileInterceptor('file'))
  async uploadMessageAttachment(@UploadedFile() file: Express.Multer.File) {
    const url = await this.storageService.uploadImage(file, 'message-attachments');
    return { url, key: `message-attachments/${file.originalname}` };
  }

  @Delete('remove/profile-picture')
  async removeProfilePicture(@Req() req: any) {
    await this.storageService.removeImage(`profile-picture/${req.user.id}`);
    await this.usersService.modifyUser(req.user.id, { profilePicture: null });
    return { success: true };
  }
}
