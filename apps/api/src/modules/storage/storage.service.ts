import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import * as sharp from 'sharp';

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private s3: S3Client;
  private bucket: string;
  private publicUrl: string;

  constructor(private configService: ConfigService) {
    this.bucket = configService.get<string>('storage.r2BucketName', 'metriva-uploads');
    this.publicUrl = configService.get<string>('storage.r2PublicUrl', '');

    this.s3 = new S3Client({
      region: 'auto',
      endpoint: configService.get<string>('storage.r2Endpoint'),
      credentials: {
        accessKeyId: configService.get<string>('storage.r2AccessKeyId', ''),
        secretAccessKey: configService.get<string>('storage.r2SecretAccessKey', ''),
      },
    });
  }

  async upload(buffer: Buffer, key: string, contentType: string): Promise<string> {
    // Optimize images before upload
    let processedBuffer = buffer;
    if (contentType.startsWith('image/')) {
      processedBuffer = await sharp(buffer)
        .resize(1920, 1080, { fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 85 })
        .toBuffer();
    }

    await this.s3.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: processedBuffer,
        ContentType: contentType,
        CacheControl: 'public, max-age=31536000', // 1 year CDN cache
      }),
    );

    return `${this.publicUrl}/${key}`;
  }

  async delete(key: string): Promise<void> {
    try {
      await this.s3.send(
        new DeleteObjectCommand({ Bucket: this.bucket, Key: key }),
      );
    } catch (error) {
      this.logger.warn(`Failed to delete ${key}: ${(error as Error).message}`);
    }
  }

  extractKey(url: string): string {
    return url.replace(`${this.publicUrl}/`, '');
  }
}
