import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';
import { createClient } from '@supabase/supabase-js';

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private supabaseClient: any;
  private provider: 'cloudinary' | 'supabase';

  constructor(private configService: ConfigService) {
    this.provider = this.configService.get<string>('STORAGE_PROVIDER', 'cloudinary') as any;

    if (this.provider === 'cloudinary') {
      cloudinary.config({
        cloud_name: this.configService.get<string>('CLOUDINARY_CLOUD_NAME'),
        api_key: this.configService.get<string>('CLOUDINARY_API_KEY'),
        api_secret: this.configService.get<string>('CLOUDINARY_API_SECRET'),
      });
      this.logger.log('Cloudinary Storage Provider Configured.');
    } else if (this.provider === 'supabase') {
      const url = this.configService.get<string>('SUPABASE_URL');
      const key = this.configService.get<string>('SUPABASE_SERVICE_ROLE_KEY');
      if (url && key) {
        this.supabaseClient = createClient(url, key);
        this.logger.log('Supabase Storage Provider Configured.');
      } else {
        this.logger.warn('Supabase URL or Key missing. Storage uploads will fail.');
      }
    }
  }

  async uploadFile(fileBuffer: Buffer, folder: string, filename: string, mimeType: string = 'image/png'): Promise<string> {
    if (this.provider === 'cloudinary') {
      return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: `3m_qr_studio/${folder}`,
            public_id: filename.split('.')[0],
            resource_type: 'auto',
          },
          (error, result) => {
            if (error) {
              this.logger.error('Cloudinary Upload Failed', error);
              return reject(error);
            }
            resolve(result.secure_url);
          }
        );
        uploadStream.end(fileBuffer);
      });
    } else if (this.provider === 'supabase') {
      if (!this.supabaseClient) {
        throw new Error('Supabase client not initialized');
      }
      const bucket = this.configService.get<string>('SUPABASE_BUCKET_NAME', 'qr-studio-assets');
      const filePath = `${folder}/${filename}`;

      const { data, error } = await this.supabaseClient.storage
        .from(bucket)
        .upload(filePath, fileBuffer, {
          contentType: mimeType,
          upsert: true,
        });

      if (error) {
        this.logger.error('Supabase Storage Upload Failed', error);
        throw error;
      }

      const { data: publicUrlData } = this.supabaseClient.storage
        .from(bucket)
        .getPublicUrl(filePath);

      return publicUrlData.publicUrl;
    } else {
      throw new Error(`Unsupported storage provider: ${this.provider}`);
    }
  }
}
