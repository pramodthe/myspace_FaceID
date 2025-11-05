import type { Database } from '../types/supabase'
import type { PixelCard, PixelCardResponse } from '../types/supabase'

// Re-export the enhanced transformation functions from type-validation
export {
  transformRowToPixelCard as dbRowToPixelCard,
  transformPixelCardToResponse as pixelCardToResponse,
  transformRowToResponse as dbRowToResponse,
} from './type-validation';

// Type utilities and helper functions
export const isValidUUID = (uuid: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};

// Additional type utilities for pixel card data
export const isValidTimestamp = (timestamp: string): boolean => {
  const date = new Date(timestamp);
  return !isNaN(date.getTime());
};

export const isValidFileSize = (size: number): boolean => {
  return typeof size === 'number' && size > 0 && size <= 10 * 1024 * 1024; // Max 10MB
};

export const isValidImageUrl = (url: string): boolean => {
  try {
    const urlObj = new URL(url);
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
  } catch {
    return false;
  }
};

// Constants for type validation
export const PIXEL_CARD_CONSTANTS = {
  MAX_USER_NAME_LENGTH: 50,
  MIN_USER_NAME_LENGTH: 1,
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_MIME_TYPES: ['image/png', 'image/jpeg'] as const,
  DEFAULT_PAGINATION_LIMIT: 20,
  MAX_PAGINATION_LIMIT: 100,
} as const;

// Type-safe error codes
export const ERROR_CODES = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  STORAGE_ERROR: 'STORAGE_ERROR',
  DATABASE_ERROR: 'DATABASE_ERROR',
  NETWORK_ERROR: 'NETWORK_ERROR',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
} as const;

export type ErrorCode = typeof ERROR_CODES[keyof typeof ERROR_CODES];