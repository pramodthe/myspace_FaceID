import { supabase } from '../lib/supabase';
import type { 
  PixelCard, 
  PixelCardResponse, 
  GalleryResponse,
  PaginationParams,
  PixelCardRow,
  MimeType 
} from '../types/supabase';

export class PixelCardRepository {
  private static readonly DEFAULT_PAGE_SIZE = 12;
  private static readonly MAX_PAGE_SIZE = 50;

  /**
   * Retrieve all pixel cards with pagination support
   */
  async getAllPixelCards(params: PaginationParams = {}): Promise<GalleryResponse> {
    try {
      const page = Math.max(1, params.page || 1);
      const limit = Math.min(
        Math.max(1, params.limit || PixelCardRepository.DEFAULT_PAGE_SIZE),
        PixelCardRepository.MAX_PAGE_SIZE
      );

      const offset = (page - 1) * limit;

      // Get total count for pagination metadata
      const { count, error: countError } = await supabase
        .from('pixel_cards')
        .select('*', { count: 'exact', head: true });

      if (countError) {
        throw new Error(`Failed to get total count: ${countError.message}`);
      }

      const total = count || 0;
      const totalPages = Math.ceil(total / limit);

      // If no cards exist, return empty response
      if (total === 0) {
        return {
          pixelCards: [],
          pagination: {
            page,
            limit,
            total: 0,
            totalPages: 0
          }
        };
      }

      // Fetch paginated results ordered by creation date (newest first)
      const { data, error } = await supabase
        .from('pixel_cards')
        .select('*')
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        throw new Error(`Failed to fetch pixel cards: ${error.message}`);
      }

      // Transform database rows to response format
      const pixelCards = (data || []).map(row => this.transformRowToResponse(row));

      return {
        pixelCards,
        pagination: {
          page,
          limit,
          total,
          totalPages
        }
      };
    } catch (error) {
      console.error('Failed to get pixel cards:', error);
      throw error instanceof Error ? error : new Error('Failed to fetch pixel cards');
    }
  }

  /**
   * Retrieve a specific pixel card by its unique identifier
   */
  async getPixelCardById(id: string): Promise<PixelCard | null> {
    try {
      // Validate ID format first
      if (!this.isValidUUID(id)) {
        throw new Error('Invalid pixel card ID format');
      }

      const { data, error } = await supabase
        .from('pixel_cards')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        // Handle not found case specifically
        if (error.code === 'PGRST116') {
          return null;
        }
        throw new Error(`Failed to fetch pixel card: ${error.message}`);
      }

      if (!data) {
        return null;
      }

      return this.transformRowToPixelCard(data);
    } catch (error) {
      console.error('Failed to get pixel card by ID:', error);
      throw error instanceof Error ? error : new Error('Failed to fetch pixel card');
    }
  }

  /**
   * Get pixel cards by user name
   */
  async getPixelCardsByUserName(
    userName: string, 
    params: PaginationParams = {}
  ): Promise<GalleryResponse> {
    try {
      if (!userName || userName.trim().length === 0) {
        throw new Error('User name is required');
      }

      const page = Math.max(1, params.page || 1);
      const limit = Math.min(
        Math.max(1, params.limit || PixelCardRepository.DEFAULT_PAGE_SIZE),
        PixelCardRepository.MAX_PAGE_SIZE
      );

      const offset = (page - 1) * limit;

      // Get total count for this user
      const { count, error: countError } = await supabase
        .from('pixel_cards')
        .select('*', { count: 'exact', head: true })
        .eq('user_name', userName);

      if (countError) {
        throw new Error(`Failed to get total count: ${countError.message}`);
      }

      const total = count || 0;
      const totalPages = Math.ceil(total / limit);

      if (total === 0) {
        return {
          pixelCards: [],
          pagination: {
            page,
            limit,
            total: 0,
            totalPages: 0
          }
        };
      }

      // Fetch paginated results for this user
      const { data, error } = await supabase
        .from('pixel_cards')
        .select('*')
        .eq('user_name', userName)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        throw new Error(`Failed to fetch pixel cards: ${error.message}`);
      }

      const pixelCards = (data || []).map(row => this.transformRowToResponse(row));

      return {
        pixelCards,
        pagination: {
          page,
          limit,
          total,
          totalPages
        }
      };
    } catch (error) {
      console.error('Failed to get pixel cards by user name:', error);
      throw error instanceof Error ? error : new Error('Failed to fetch pixel cards');
    }
  }

  /**
   * Check if a pixel card exists by ID
   */
  async pixelCardExists(id: string): Promise<boolean> {
    try {
      if (!this.isValidUUID(id)) {
        return false;
      }

      const { data, error } = await supabase
        .from('pixel_cards')
        .select('id')
        .eq('id', id)
        .single();

      if (error) {
        // Not found is expected for non-existent cards
        if (error.code === 'PGRST116') {
          return false;
        }
        throw new Error(`Failed to check pixel card existence: ${error.message}`);
      }

      return !!data;
    } catch (error) {
      console.error('Error checking pixel card existence:', error);
      return false;
    }
  }

  /**
   * Get recent pixel cards (last N cards)
   */
  async getRecentPixelCards(limit: number = 6): Promise<PixelCardResponse[]> {
    try {
      const safeLimit = Math.min(Math.max(1, limit), PixelCardRepository.MAX_PAGE_SIZE);

      const { data, error } = await supabase
        .from('pixel_cards')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(safeLimit);

      if (error) {
        throw new Error(`Failed to fetch recent pixel cards: ${error.message}`);
      }

      return (data || []).map(row => this.transformRowToResponse(row));
    } catch (error) {
      console.error('Failed to get recent pixel cards:', error);
      throw error instanceof Error ? error : new Error('Failed to fetch recent pixel cards');
    }
  }

  /**
   * Transform database row to PixelCard entity
   */
  private transformRowToPixelCard(row: PixelCardRow): PixelCard {
    return {
      id: row.id,
      userName: row.user_name,
      imagePath: row.image_path,
      imageUrl: row.image_url,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
      fileSize: row.file_size,
      mimeType: row.mime_type as MimeType
    };
  }

  /**
   * Transform database row to response format
   */
  private transformRowToResponse(row: PixelCardRow): PixelCardResponse {
    return {
      id: row.id,
      userName: row.user_name,
      imageUrl: row.image_url,
      createdAt: row.created_at,
      fileSize: row.file_size
    };
  }

  /**
   * Validate UUID format
   */
  private isValidUUID(uuid: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  }
}

// Export singleton instance
export const pixelCardRepository = new PixelCardRepository();