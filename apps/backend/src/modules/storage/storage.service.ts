import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const ALLOWED_DOCUMENT_TYPES = ['application/pdf'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private s3Client: S3Client;
  private bucket: string;

  constructor(private config: ConfigService) {
    this.s3Client = new S3Client({
      endpoint: this.config.get<string>('S3_ENDPOINT', 'http://localhost:9000'),
      region: this.config.get<string>('S3_REGION', 'us-east-1'),
      credentials: {
        accessKeyId: this.config.get<string>('S3_ACCESS_KEY', 'minioadmin'),
        secretAccessKey: this.config.get<string>('S3_SECRET_KEY', 'minioadmin'),
      },
      forcePathStyle: true,
    });

    this.bucket = this.config.get<string>('S3_BUCKET', 'default-bucket');
  }

  /**
   * Sanitizes filename to prevent path traversal attacks
   */
  private sanitizeFilename(filename: string): string {
    return filename
      .replace(/[^a-zA-Z0-9.-]/g, '_')
      .replace(/\.{2,}/g, '.')
      .substring(0, 100);
  }

  /**
   * Validates file type against allowed types
   */
  private validateFileType(mimetype: string, allowedTypes: string[]): void {
    if (!allowedTypes.includes(mimetype)) {
      throw new BadRequestException(
        `Invalid file type: ${mimetype}. Allowed types: ${allowedTypes.join(', ')}`,
      );
    }
  }

  /**
   * Validates file size against maximum allowed
   */
  private validateFileSize(size: number, maxSize: number = MAX_FILE_SIZE): void {
    if (size > maxSize) {
      const maxSizeMB = Math.round(maxSize / (1024 * 1024));
      throw new BadRequestException(`File too large. Maximum size: ${maxSizeMB}MB`);
    }
  }

  async uploadImage(file: Express.Multer.File, folder: string): Promise<string> {
    this.validateFileType(file.mimetype, ALLOWED_IMAGE_TYPES);
    this.validateFileSize(file.size, 5 * 1024 * 1024); // 5MB max for images

    return this.uploadFile(file, folder);
  }

  async uploadDocument(file: Express.Multer.File, folder: string): Promise<string> {
    this.validateFileType(file.mimetype, ALLOWED_DOCUMENT_TYPES);
    this.validateFileSize(file.size);

    return this.uploadFile(file, folder);
  }

  async uploadFile(file: Express.Multer.File, folder: string): Promise<string> {
    const sanitizedFolder = this.sanitizeFilename(folder);
    const sanitizedFilename = this.sanitizeFilename(file.originalname);
    const key = `${sanitizedFolder}/${Date.now()}-${sanitizedFilename}`;

    try {
      await this.s3Client.send(
        new PutObjectCommand({
          Bucket: this.bucket,
          Key: key,
          Body: file.buffer,
          ContentType: file.mimetype,
        }),
      );

      this.logger.log(`File uploaded successfully: ${key}`);
      return this.getPublicUrl(key);
    } catch (error) {
      this.logger.error(`Failed to upload file: ${error.message}`, error.stack);
      throw new BadRequestException('Failed to upload file');
    }
  }

  async deleteFile(key: string): Promise<void> {
    if (!key || key.includes('..')) {
      throw new BadRequestException('Invalid file key');
    }

    try {
      await this.s3Client.send(
        new DeleteObjectCommand({
          Bucket: this.bucket,
          Key: key,
        }),
      );
      this.logger.log(`File deleted successfully: ${key}`);
    } catch (error) {
      this.logger.error(`Failed to delete file: ${error.message}`, error.stack);
      throw new BadRequestException('Failed to delete file');
    }
  }

  async getSignedUploadUrl(key: string, contentType: string): Promise<string> {
    if (!ALLOWED_IMAGE_TYPES.includes(contentType) && !ALLOWED_DOCUMENT_TYPES.includes(contentType)) {
      throw new BadRequestException(`Invalid content type: ${contentType}`);
    }

    const sanitizedKey = this.sanitizeFilename(key);

    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: sanitizedKey,
      ContentType: contentType,
    });

    return getSignedUrl(this.s3Client, command, { expiresIn: 3600 });
  }

  private getPublicUrl(key: string): string {
    const endpoint = this.config.get('S3_ENDPOINT');
    return `${endpoint}/${this.bucket}/${key}`;
  }
}
