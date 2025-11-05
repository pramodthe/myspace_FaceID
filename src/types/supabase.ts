export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      pixel_cards: {
        Row: {
          id: string
          user_name: string
          image_path: string
          image_url: string
          created_at: string
          updated_at: string
          file_size: number
          mime_type: string
        }
        Insert: {
          id?: string
          user_name: string
          image_path: string
          image_url: string
          created_at?: string
          updated_at?: string
          file_size: number
          mime_type: string
        }
        Update: {
          id?: string
          user_name?: string
          image_path?: string
          image_url?: string
          created_at?: string
          updated_at?: string
          file_size?: number
          mime_type?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// Application-specific types
export interface PixelCard {
  id: string
  userName: string
  imagePath: string
  imageUrl: string
  createdAt: Date
  updatedAt: Date
  fileSize: number
  mimeType: string
}

export interface CreatePixelCardRequest {
  userName: string
  imageData: string // Base64 encoded image
}

export interface PixelCardResponse {
  id: string
  userName: string
  imageUrl: string
  createdAt: string
  fileSize: number
}

export interface GalleryResponse {
  pixelCards: PixelCardResponse[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface ErrorResponse {
  error: {
    code: string
    message: string
    details?: any
  }
  timestamp: string
  path: string
}

// Additional type definitions for enhanced type safety

export type MimeType = 'image/png' | 'image/jpeg';

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PixelCardInsert {
  user_name: string;
  image_path: string;
  image_url: string;
  file_size: number;
  mime_type: MimeType;
}

export interface PixelCardUpdate {
  user_name?: string;
  image_path?: string;
  image_url?: string;
  file_size?: number;
  mime_type?: MimeType;
  updated_at?: string;
}

// Type guards for runtime type checking
export const isPixelCard = (obj: any): obj is PixelCard => {
  return (
    obj &&
    typeof obj === 'object' &&
    typeof obj.id === 'string' &&
    typeof obj.userName === 'string' &&
    typeof obj.imagePath === 'string' &&
    typeof obj.imageUrl === 'string' &&
    obj.createdAt instanceof Date &&
    obj.updatedAt instanceof Date &&
    typeof obj.fileSize === 'number' &&
    typeof obj.mimeType === 'string'
  );
};

export const isCreatePixelCardRequest = (obj: any): obj is CreatePixelCardRequest => {
  return (
    obj &&
    typeof obj === 'object' &&
    typeof obj.userName === 'string' &&
    typeof obj.imageData === 'string'
  );
};

export const isPixelCardResponse = (obj: any): obj is PixelCardResponse => {
  return (
    obj &&
    typeof obj === 'object' &&
    typeof obj.id === 'string' &&
    typeof obj.userName === 'string' &&
    typeof obj.imageUrl === 'string' &&
    typeof obj.createdAt === 'string' &&
    typeof obj.fileSize === 'number'
  );
};

export const isMimeType = (value: string): value is MimeType => {
  return value === 'image/png' || value === 'image/jpeg';
};

// Utility types for database operations
export type PixelCardRow = Database['public']['Tables']['pixel_cards']['Row'];
export type PixelCardInsertPayload = Database['public']['Tables']['pixel_cards']['Insert'];
export type PixelCardUpdatePayload = Database['public']['Tables']['pixel_cards']['Update'];

// Legacy transform functions - kept for backward compatibility
// Note: Enhanced versions are available in ../lib/type-validation
export const transformRowToPixelCard = (row: PixelCardRow): PixelCard => {
  return {
    id: row.id,
    userName: row.user_name,
    imagePath: row.image_path,
    imageUrl: row.image_url,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
    fileSize: row.file_size,
    mimeType: row.mime_type,
  };
};

export const transformPixelCardToResponse = (pixelCard: PixelCard): PixelCardResponse => {
  return {
    id: pixelCard.id,
    userName: pixelCard.userName,
    imageUrl: pixelCard.imageUrl,
    createdAt: pixelCard.createdAt.toISOString(),
    fileSize: pixelCard.fileSize,
  };
};

export const transformRowToResponse = (row: PixelCardRow): PixelCardResponse => {
  return {
    id: row.id,
    userName: row.user_name,
    imageUrl: row.image_url,
    createdAt: row.created_at,
    fileSize: row.file_size,
  };
};