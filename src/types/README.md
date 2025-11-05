# Data Models and Types Documentation

This directory contains all TypeScript type definitions and data models for the Pixel Backend System.

## Files Overview

### Core Types
- **`supabase.ts`** - Main type definitions including Supabase database types and application models
- **`README.md`** - This documentation file

### Related Files
- **`../lib/type-validation.ts`** - Type validation and transformation utilities
- **`../lib/validation.ts`** - Input validation schemas and rules

## Type Categories

### 1. Database Types (Auto-generated)

These types are generated from the Supabase database schema:

```typescript
// Database table structure
interface Database {
  public: {
    Tables: {
      pixel_cards: {
        Row: PixelCardRow;
        Insert: PixelCardInsertPayload;
        Update: PixelCardUpdatePayload;
      }
    }
  }
}
```

### 2. Application Models

Core business logic types used throughout the application:

#### PixelCard
```typescript
interface PixelCard {
  id: string;              // UUID v4
  userName: string;        // User's name (max 50 characters)
  imagePath: string;       // Relative path to stored image
  imageUrl: string;        // Public URL for image access
  createdAt: Date;         // Creation timestamp
  updatedAt: Date;         // Last modification timestamp
  fileSize: number;        // Image file size in bytes
  mimeType: string;        // Image MIME type
}
```

#### CreatePixelCardRequest
```typescript
interface CreatePixelCardRequest {
  userName: string;        // User's name
  imageData: string;       // Base64 encoded image with data URI prefix
}
```

#### PixelCardResponse
```typescript
interface PixelCardResponse {
  id: string;
  userName: string;
  imageUrl: string;
  createdAt: string;       // ISO string format
  fileSize: number;
}
```

### 3. API Response Types

#### GalleryResponse
```typescript
interface GalleryResponse {
  pixelCards: PixelCardResponse[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
```

#### ErrorResponse
```typescript
interface ErrorResponse {
  error: {
    code: string;
    message: string;
    details?: any;
  };
  timestamp: string;
  path: string;
}
```

### 4. Utility Types

#### MimeType
```typescript
type MimeType = 'image/png' | 'image/jpeg';
```

#### PaginationParams
```typescript
interface PaginationParams {
  page?: number;
  limit?: number;
}
```

## Type Guards

Runtime type checking functions to ensure type safety:

```typescript
// Check if object is a valid PixelCard
isPixelCard(obj: any): obj is PixelCard

// Check if object is a valid CreatePixelCardRequest
isCreatePixelCardRequest(obj: any): obj is CreatePixelCardRequest

// Check if object is a valid PixelCardResponse
isPixelCardResponse(obj: any): obj is PixelCardResponse

// Check if string is a valid MimeType
isMimeType(value: string): value is MimeType
```

## Transform Functions

Functions to convert between different type representations:

```typescript
// Convert database row to application model
transformRowToPixelCard(row: PixelCardRow): PixelCard

// Convert application model to API response
transformPixelCardToResponse(pixelCard: PixelCard): PixelCardResponse

// Convert database row directly to API response
transformRowToResponse(row: PixelCardRow): PixelCardResponse
```

## Validation Integration

The types work closely with validation utilities:

### Input Validation
- **User Name**: 1-50 characters, alphanumeric + spaces/hyphens/underscores
- **Image Data**: Valid base64 PNG/JPEG, max 10MB
- **File Size**: Positive number, max 10MB
- **MIME Type**: Must be 'image/png' or 'image/jpeg'

### Validation Functions
```typescript
// From ../lib/validation.ts
validateUserName(userName: string): ValidationResult
validateImageData(imageData: string): ValidationResult
validateCreatePixelCardRequest(request: any): ValidationResult
```

## Usage Examples

### Creating a Pixel Card
```typescript
import { CreatePixelCardRequest, validateCreatePixelCardRequest } from '../types/supabase';

const request: CreatePixelCardRequest = {
  userName: 'John Doe',
  imageData: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='
};

const validation = validateCreatePixelCardRequest(request);
if (validation.isValid) {
  // Proceed with creation
} else {
  console.error('Validation errors:', validation.errors);
}
```

### Working with Database Results
```typescript
import { transformRowToResponse } from '../types/supabase';
import { supabase } from '../lib/supabase';

const { data, error } = await supabase
  .from('pixel_cards')
  .select('*')
  .order('created_at', { ascending: false });

if (data) {
  const responses = data.map(transformRowToResponse);
  // Use responses...
}
```

### Type-Safe Supabase Operations
```typescript
import { Database } from '../types/supabase';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient<Database>(url, key);

// TypeScript will enforce correct table and column names
const { data } = await supabase
  .from('pixel_cards')  // ✅ Correct table name
  .select('id, user_name, image_url')  // ✅ Correct column names
  .eq('user_name', 'John');  // ✅ Type-safe filtering
```

## Type Generation

### Automatic Generation
Use the provided script to generate types from your Supabase database:

```bash
npm run generate-types
```

This script:
1. Checks for Supabase CLI installation
2. Extracts project ID from environment variables
3. Generates fresh types from database schema
4. Preserves custom application types
5. Creates backup of existing types

### Manual Generation
If automatic generation fails, you can manually generate types:

```bash
# Install Supabase CLI globally
npm install -g supabase

# Generate types for your project
supabase gen types typescript --project-id YOUR_PROJECT_ID > src/types/database.ts
```

### Requirements Satisfied

This implementation addresses the following requirements:

- **1.2**: Unique identifier assignment and data structure
- **1.3**: Type-safe data handling and validation
- **4.3**: Input validation for security
- **5.1**: Comprehensive validation schemas

## Best Practices

1. **Always use type guards** when working with external data
2. **Validate input** before database operations
3. **Transform data** between layers (database ↔ application ↔ API)
4. **Keep types in sync** with database schema
5. **Use utility types** for common operations
6. **Document type changes** and migration paths

## Testing

All types and validation functions are covered by comprehensive tests in:
- `../lib/__tests__/validation.test.ts`

Run tests with:
```bash
npm test
```

## Migration Notes

When updating database schema:
1. Update `supabase-setup.sql` in the backend directory
2. Run `npm run generate-types` to update TypeScript types
3. Update validation rules if needed
4. Run tests to ensure compatibility
5. Update documentation as needed