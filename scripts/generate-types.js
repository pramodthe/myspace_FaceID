#!/usr/bin/env node

/**
 * Script to generate Supabase types
 * This script attempts to generate TypeScript types from the Supabase database schema
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TYPES_FILE = path.join(__dirname, '../src/types/supabase.ts');

function checkSupabaseCLI() {
  try {
    execSync('supabase --version', { stdio: 'ignore' });
    return true;
  } catch (error) {
    return false;
  }
}

function generateTypes() {
  console.log('🔄 Generating Supabase types...');
  
  if (!checkSupabaseCLI()) {
    console.log('⚠️  Supabase CLI not found. Please install it to generate types automatically.');
    console.log('📖 Manual installation: npm install -g supabase');
    console.log('📖 Or use: npx supabase gen types typescript --project-id YOUR_PROJECT_ID');
    console.log('✅ Using existing manually created types in src/types/supabase.ts');
    return;
  }

  try {
    // Check if we have a project ID in environment
    const projectId = process.env.VITE_SUPABASE_URL?.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1];
    
    if (!projectId) {
      console.log('⚠️  No Supabase project ID found in VITE_SUPABASE_URL');
      console.log('📖 Please set VITE_SUPABASE_URL in your .env.local file');
      console.log('✅ Using existing manually created types in src/types/supabase.ts');
      return;
    }

    // Generate types using Supabase CLI
    const command = `supabase gen types typescript --project-id ${projectId}`;
    const generatedTypes = execSync(command, { encoding: 'utf8' });
    
    // Backup existing types
    if (fs.existsSync(TYPES_FILE)) {
      const backupFile = TYPES_FILE.replace('.ts', '.backup.ts');
      fs.copyFileSync(TYPES_FILE, backupFile);
      console.log(`📦 Backed up existing types to ${path.basename(backupFile)}`);
    }
    
    // Write new types (but preserve our custom application types)
    const customTypes = `
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
`;
    
    const fullTypes = generatedTypes + customTypes;
    fs.writeFileSync(TYPES_FILE, fullTypes);
    
    console.log('✅ Successfully generated Supabase types!');
    console.log(`📁 Types saved to ${path.relative(process.cwd(), TYPES_FILE)}`);
    
  } catch (error) {
    console.error('❌ Error generating types:', error.message);
    console.log('✅ Using existing manually created types in src/types/supabase.ts');
  }
}

// Run if this is the main module
if (import.meta.url === `file://${process.argv[1]}`) {
  generateTypes();
}

export { generateTypes, checkSupabaseCLI };