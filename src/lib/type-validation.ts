/**
 * Type validation and transformation utilities for Supabase integration
 * Ensures type safety between database operations and application logic
 */

import type {
  Database,
  PixelCard,
  PixelCardResponse,
  CreatePixelCardRequest,
  PixelCardRow,
  PixelCardInsert,
  MimeType
} from '../types/supabase';

/**
 * Validates that a database row matches the expected PixelCardRow type
 */
export function validatePixelCardRow(row: any): row is PixelCardRow {
  return (
    row &&
    typeof row === 'object' &&
    typeof row.id === 'string' &&
    typeof row.user_name === 'string' &&
    typeof row.image_path === 'string' &&
    typeof row.image_url === 'string' &&
    typeof row.created_at === 'string' &&
    typeof row.updated_at === 'string' &&
    typeof row.file_size === 'number' &&
    typeof row.mime_type === 'string' &&
    (row.mime_type === 'image/png' || row.mime_type === 'image/jpeg')
  );
}

/**
 * Validates that an object matches the PixelCardInsert type
 */
export function validatePixelCardInsert(insert: any): insert is PixelCardInsert {
  return (
    insert &&
    typeof insert === 'object' &&
    typeof insert.user_name === 'string' &&
    typeof insert.image_path === 'string' &&
    typeof insert.image_url === 'string' &&
    typeof insert.file_size === 'number' &&
    typeof insert.mime_type === 'string' &&
    (insert.mime_type === 'image/png' || insert.mime_type === 'image/jpeg')
  );
}

/**
 * Validates that an object matches the CreatePixelCardRequest type
 */
export function validateCreateRequest(request: any): request is CreatePixelCardRequest {
  return (
    request &&
    typeof request === 'object' &&
    typeof request.userName === 'string' &&
    typeof request.imageData === 'string'
  );
}

/**
 * Transforms a database row to application PixelCard type
 */
export function transformRowToPixelCard(row: PixelCardRow): PixelCard {
  if (!validatePixelCardRow(row)) {
    throw new Error('Invalid pixel card row data');
  }

  return {
    id: row.id,
    userName: row.user_name,
    imagePath: row.image_path,
    imageUrl: row.image_url,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
    fileSize: row.file_size,
    mimeType: row.mime_type as MimeType,
  };
}

/**
 * Transforms application PixelCard to API response format
 */
export function transformPixelCardToResponse(pixelCard: PixelCard): PixelCardResponse {
  return {
    id: pixelCard.id,
    userName: pixelCard.userName,
    imageUrl: pixelCard.imageUrl,
    createdAt: pixelCard.createdAt.toISOString(),
    fileSize: pixelCard.fileSize,
  };
}

/**
 * Transforms database row directly to API response format
 */
export function transformRowToResponse(row: PixelCardRow): PixelCardResponse {
  if (!validatePixelCardRow(row)) {
    throw new Error('Invalid pixel card row data');
  }

  return {
    id: row.id,
    userName: row.user_name,
    imageUrl: row.image_url,
    createdAt: row.created_at,
    fileSize: row.file_size,
  };
}

/**
 * Creates a PixelCardInsert object from CreatePixelCardRequest and file metadata
 */
export function createInsertFromRequest(
  request: CreatePixelCardRequest,
  imagePath: string,
  imageUrl: string,
  fileSize: number,
  mimeType: MimeType
): PixelCardInsert {
  if (!validateCreateRequest(request)) {
    throw new Error('Invalid create pixel card request');
  }

  return {
    user_name: request.userName.trim(),
    image_path: imagePath,
    image_url: imageUrl,
    file_size: fileSize,
    mime_type: mimeType,
  };
}

/**
 * Type-safe database table reference
 */
export type PixelCardsTable = Database['public']['Tables']['pixel_cards'];

/**
 * Utility type for Supabase query results
 */
export type SupabaseQueryResult<T> = {
  data: T | null;
  error: Error | null;
};

/**
 * Utility type for paginated results
 */
export interface PaginatedResult<T> {
  data: T[];
  count: number | null;
  error: Error | null;
}

/**
 * Creates a type-safe error response
 */
export function createErrorResponse(
  code: string,
  message: string,
  details?: any,
  path?: string
) {
  return {
    error: {
      code,
      message,
      details,
    },
    timestamp: new Date().toISOString(),
    path: path || '',
  };
}

/**
 * Validates pagination parameters and returns safe values
 */
export function validateAndNormalizePagination(page?: number, limit?: number) {
  const safePage = Math.max(1, Math.floor(page || 1));
  const safeLimit = Math.min(100, Math.max(1, Math.floor(limit || 20)));
  
  return {
    page: safePage,
    limit: safeLimit,
    offset: (safePage - 1) * safeLimit,
  };
}

/**
 * Type guard for checking if a value is a valid MimeType
 */
export function isMimeType(value: string): value is MimeType {
  return value === 'image/png' || value === 'image/jpeg';
}

/**
 * Extracts MIME type from base64 data URI and validates it
 */
export function extractAndValidateMimeType(dataUri: string): MimeType {
  const match = dataUri.match(/^data:([^;]+);base64,/);
  if (!match) {
    throw new Error('Invalid data URI format');
  }

  const mimeType = match[1];
  if (!isMimeType(mimeType)) {
    throw new Error(`Unsupported MIME type: ${mimeType}. Only PNG and JPEG are allowed.`);
  }

  return mimeType;
}

/**
 * Calculates file size from base64 data
 */
export function calculateBase64FileSize(base64Data: string): number {
  // Remove data URI prefix if present
  const base64Content = base64Data.includes(',') 
    ? base64Data.split(',')[1] 
    : base64Data;
  
  // Calculate actual file size (base64 is ~33% larger than binary)
  const padding = (base64Content.match(/=/g) || []).length;
  return Math.floor((base64Content.length * 3) / 4) - padding;
}

/**
 * Generates a unique file path for storing pixel card images
 */
export function generateImagePath(userName: string, mimeType: MimeType): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  
  // Create safe filename from username
  const safeUserName = userName
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '')
    .substring(0, 20);
  
  const timestamp = Date.now();
  const randomSuffix = Math.random().toString(36).substring(2, 8);
  const extension = mimeType === 'image/png' ? 'png' : 'jpeg';
  
  return `${year}/${month}/${safeUserName}_${timestamp}_${randomSuffix}.${extension}`;
}