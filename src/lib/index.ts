// Supabase client and utilities
export { supabase } from './supabase'
export * from './typeUtils'
export * from './validation'
export * from './type-validation'

// Services
export { PixelCardService, pixelCardService } from '../services/pixelCardService'
export { PixelCardRepository, pixelCardRepository } from '../services/pixelCardRepository'

// Types (only export types, not values to avoid conflicts)
export type {
  Database,
  PixelCard,
  CreatePixelCardRequest,
  PixelCardResponse,
  GalleryResponse,
  MimeType,
  PaginationParams,
  PixelCardInsert,
  PixelCardUpdate,
  PixelCardRow,
  PixelCardInsertPayload,
  PixelCardUpdatePayload
} from '../types/supabase'