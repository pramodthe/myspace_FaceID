/**
 * Validation utilities for pixel card data
 * Implements validation schemas as specified in requirements 4.3 and 5.1
 */

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface ValidationRule<T> {
  validate: (value: T) => ValidationResult;
}

// Constants for validation limits
export const VALIDATION_LIMITS = {
  USER_NAME_MAX_LENGTH: 50,
  USER_NAME_MIN_LENGTH: 1,
  IMAGE_MAX_SIZE_BYTES: 10 * 1024 * 1024, // 10MB
  ALLOWED_MIME_TYPES: ['image/png', 'image/jpeg'] as const,
  BASE64_IMAGE_PREFIX_PATTERN: /^data:image\/(png|jpeg);base64,/,
} as const;

/**
 * Validates user name according to requirements
 * - Must be 1-50 characters
 * - Must contain only alphanumeric characters, spaces, hyphens, and underscores
 */
export const validateUserName: ValidationRule<string> = {
  validate: (userName: string): ValidationResult => {
    const errors: string[] = [];

    if (!userName || typeof userName !== 'string') {
      errors.push('User name is required');
      return { isValid: false, errors };
    }

    const trimmedName = userName.trim();

    if (trimmedName.length < VALIDATION_LIMITS.USER_NAME_MIN_LENGTH) {
      errors.push('User name cannot be empty');
    }

    if (trimmedName.length > VALIDATION_LIMITS.USER_NAME_MAX_LENGTH) {
      errors.push(`User name cannot exceed ${VALIDATION_LIMITS.USER_NAME_MAX_LENGTH} characters`);
    }

    // Allow alphanumeric characters, spaces, hyphens, underscores, and common punctuation
    const validNamePattern = /^[a-zA-Z0-9\s\-_'.]+$/;
    if (!validNamePattern.test(trimmedName)) {
      errors.push('User name contains invalid characters. Only letters, numbers, spaces, hyphens, underscores, apostrophes, and periods are allowed');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
};

/**
 * Validates base64 image data according to requirements
 * - Must be valid base64 format with proper data URI prefix
 * - Must be PNG or JPEG format
 * - Must not exceed size limits
 */
export const validateImageData: ValidationRule<string> = {
  validate: (imageData: string): ValidationResult => {
    const errors: string[] = [];

    if (!imageData || typeof imageData !== 'string') {
      errors.push('Image data is required');
      return { isValid: false, errors };
    }

    // Check for proper data URI format
    if (!VALIDATION_LIMITS.BASE64_IMAGE_PREFIX_PATTERN.test(imageData)) {
      errors.push('Image data must be a valid PNG or JPEG in base64 format');
      return { isValid: false, errors };
    }

    try {
      // Extract the base64 part (after the comma)
      const base64Data = imageData.split(',')[1];
      if (!base64Data) {
        errors.push('Invalid base64 image format');
        return { isValid: false, errors };
      }

      // Validate base64 format
      const base64Pattern = /^[A-Za-z0-9+/]*={0,2}$/;
      if (!base64Pattern.test(base64Data)) {
        errors.push('Invalid base64 encoding');
        return { isValid: false, errors };
      }

      // Estimate file size (base64 is ~33% larger than binary)
      const estimatedSize = (base64Data.length * 3) / 4;
      if (estimatedSize > VALIDATION_LIMITS.IMAGE_MAX_SIZE_BYTES) {
        errors.push(`Image size exceeds maximum limit of ${VALIDATION_LIMITS.IMAGE_MAX_SIZE_BYTES / (1024 * 1024)}MB`);
      }

    } catch (error) {
      errors.push('Invalid image data format');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
};

/**
 * Validates MIME type for uploaded images
 */
export const validateMimeType: ValidationRule<string> = {
  validate: (mimeType: string): ValidationResult => {
    const errors: string[] = [];

    if (!mimeType || typeof mimeType !== 'string') {
      errors.push('MIME type is required');
      return { isValid: false, errors };
    }

    if (!VALIDATION_LIMITS.ALLOWED_MIME_TYPES.includes(mimeType as any)) {
      errors.push(`Invalid MIME type. Allowed types: ${VALIDATION_LIMITS.ALLOWED_MIME_TYPES.join(', ')}`);
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
};

/**
 * Validates file size in bytes
 */
export const validateFileSize: ValidationRule<number> = {
  validate: (fileSize: number): ValidationResult => {
    const errors: string[] = [];

    if (typeof fileSize !== 'number' || fileSize <= 0) {
      errors.push('File size must be a positive number');
      return { isValid: false, errors };
    }

    if (fileSize > VALIDATION_LIMITS.IMAGE_MAX_SIZE_BYTES) {
      errors.push(`File size exceeds maximum limit of ${VALIDATION_LIMITS.IMAGE_MAX_SIZE_BYTES / (1024 * 1024)}MB`);
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
};

/**
 * Validates a complete CreatePixelCardRequest
 */
export const validateCreatePixelCardRequest = (request: any): ValidationResult => {
  const errors: string[] = [];

  if (!request || typeof request !== 'object') {
    return {
      isValid: false,
      errors: ['Request data is required']
    };
  }

  // Validate user name
  const userNameValidation = validateUserName.validate(request.userName);
  if (!userNameValidation.isValid) {
    errors.push(...userNameValidation.errors);
  }

  // Validate image data
  const imageDataValidation = validateImageData.validate(request.imageData);
  if (!imageDataValidation.isValid) {
    errors.push(...imageDataValidation.errors);
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Validates pagination parameters
 */
export const validatePaginationParams = (page?: number, limit?: number): ValidationResult => {
  const errors: string[] = [];

  if (page !== undefined) {
    if (typeof page !== 'number' || page < 1) {
      errors.push('Page must be a positive number starting from 1');
    }
  }

  if (limit !== undefined) {
    if (typeof limit !== 'number' || limit < 1 || limit > 100) {
      errors.push('Limit must be a number between 1 and 100');
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Sanitizes user input by trimming whitespace and removing potentially harmful characters
 */
export const sanitizeUserName = (userName: string): string => {
  if (!userName || typeof userName !== 'string') {
    return '';
  }

  return userName
    .trim()
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .substring(0, VALIDATION_LIMITS.USER_NAME_MAX_LENGTH); // Ensure max length
};

/**
 * Extracts MIME type from base64 data URI
 */
export const extractMimeTypeFromDataUri = (dataUri: string): string | null => {
  const match = dataUri.match(/^data:([^;]+);base64,/);
  return match ? match[1] : null;
};

/**
 * Generates a safe filename from user name and timestamp
 */
export const generateSafeFilename = (userName: string, extension: string = 'png'): string => {
  const sanitizedName = userName
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');
  
  const timestamp = Date.now();
  const randomSuffix = Math.random().toString(36).substring(2, 8);
  
  return `${sanitizedName}_${timestamp}_${randomSuffix}.${extension}`;
};