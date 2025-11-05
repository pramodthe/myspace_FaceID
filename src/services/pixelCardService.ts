import { supabase } from '../lib/supabase';
import { 
  validateCreatePixelCardRequest,
  extractMimeTypeFromDataUri,
  VALIDATION_LIMITS 
} from '../lib/validation';
import type { 
  CreatePixelCardRequest, 
  PixelCard, 
  PixelCardResponse, 
  MimeType,
  PixelCardInsertPayload 
} from '../types/supabase';

export class PixelCardService {
  private static readonly STORAGE_BUCKET = 'pixel-images';

  /**
   * Save a pixel card with image upload to Supabase Storage
   */
  async savePixelCard(request: CreatePixelCardRequest): Promise<PixelCardResponse> {
    try {
      // Validate input
      this.validateCreateRequest(request);

      // Process image data
      const { imageBuffer, mimeType, fileSize } = this.processImageData(request.imageData);

      // Generate unique filename with date structure
      const filename = this.generateUniqueFilename(mimeType);
      const imagePath = this.generateImagePath(filename);

      // Upload image to Supabase Storage
      const imageUrl = await this.uploadImage(imagePath, imageBuffer, mimeType);

      // Save pixel card data to database
      const pixelCard = await this.saveToDatabase({
        user_name: request.userName,
        image_path: imagePath,
        image_url: imageUrl,
        file_size: fileSize,
        mime_type: mimeType
      });

      return this.transformToResponse(pixelCard);
    } catch (error) {
      console.error('Failed to save pixel card:', error);
      throw error instanceof Error ? error : new Error('Failed to save pixel card');
    }
  }

  /**
   * Validate create pixel card request
   */
  private validateCreateRequest(request: CreatePixelCardRequest): void {
    const validation = validateCreatePixelCardRequest(request);
    if (!validation.isValid) {
      throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
    }
  }

  /**
   * Process base64 image data and extract metadata
   */
  private processImageData(imageData: string): { 
    imageBuffer: Uint8Array; 
    mimeType: MimeType; 
    fileSize: number; 
  } {
    try {
      // Extract MIME type
      const mimeType = extractMimeTypeFromDataUri(imageData) as MimeType;
      if (!mimeType || !VALIDATION_LIMITS.ALLOWED_MIME_TYPES.includes(mimeType as any)) {
        throw new Error(`Unsupported image format. Allowed formats: ${VALIDATION_LIMITS.ALLOWED_MIME_TYPES.join(', ')}`);
      }

      // Extract base64 data
      const base64Data = imageData.split(',')[1];
      if (!base64Data) {
        throw new Error('No image data found');
      }

      // Convert to buffer
      const imageBuffer = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
      const fileSize = imageBuffer.length;

      // Validate file size
      if (fileSize > VALIDATION_LIMITS.IMAGE_MAX_SIZE_BYTES) {
        throw new Error(`File size exceeds maximum allowed size of ${VALIDATION_LIMITS.IMAGE_MAX_SIZE_BYTES / (1024 * 1024)}MB`);
      }

      if (fileSize === 0) {
        throw new Error('Image data is empty');
      }

      return { imageBuffer, mimeType, fileSize };
    } catch (error) {
      throw error instanceof Error ? error : new Error('Failed to process image data');
    }
  }

  /**
   * Generate unique filename with UUID and proper extension
   */
  private generateUniqueFilename(mimeType: MimeType): string {
    const uuid = crypto.randomUUID();
    const extension = mimeType === 'image/png' ? 'png' : 'jpg';
    return `${uuid}.${extension}`;
  }

  /**
   * Generate organized image path with date structure
   */
  private generateImagePath(filename: string): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    return `${year}/${month}/${filename}`;
  }

  /**
   * Upload image to Supabase Storage
   */
  private async uploadImage(imagePath: string, imageBuffer: Uint8Array, mimeType: MimeType): Promise<string> {
    const { data, error } = await supabase.storage
      .from(PixelCardService.STORAGE_BUCKET)
      .upload(imagePath, imageBuffer, {
        contentType: mimeType,
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      throw new Error(`Storage upload failed: ${error.message}`);
    }

    if (!data?.path) {
      throw new Error('Upload succeeded but no path returned');
    }

    // Get public URL for the uploaded image
    const { data: urlData } = supabase.storage
      .from(PixelCardService.STORAGE_BUCKET)
      .getPublicUrl(data.path);

    if (!urlData?.publicUrl) {
      throw new Error('Failed to get public URL for uploaded image');
    }

    return urlData.publicUrl;
  }

  /**
   * Save pixel card data to database
   */
  private async saveToDatabase(insertData: PixelCardInsertPayload): Promise<PixelCard> {
    const { data, error } = await supabase
      .from('pixel_cards')
      .insert(insertData)
      .select()
      .single();

    if (error) {
      throw new Error(`Database insert failed: ${error.message}`);
    }

    if (!data) {
      throw new Error('Insert succeeded but no data returned');
    }

    // Transform database row to PixelCard
    return {
      id: data.id,
      userName: data.user_name,
      imagePath: data.image_path,
      imageUrl: data.image_url,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
      fileSize: data.file_size,
      mimeType: data.mime_type as MimeType
    };
  }

  /**
   * Transform PixelCard to response format
   */
  private transformToResponse(pixelCard: PixelCard): PixelCardResponse {
    return {
      id: pixelCard.id,
      userName: pixelCard.userName,
      imageUrl: pixelCard.imageUrl,
      createdAt: pixelCard.createdAt.toISOString(),
      fileSize: pixelCard.fileSize
    };
  }
}

// Export singleton instance
export const pixelCardService = new PixelCardService();