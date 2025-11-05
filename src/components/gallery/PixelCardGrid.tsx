import React from 'react';
import type { PixelCardResponse } from '../../types/supabase.js';
import PixelCardItem from './PixelCardItem.js';
import PaginationControls from './PaginationControls.js';

interface PixelCardGridProps {
  pixelCards: PixelCardResponse[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  onPageChange: (page: number) => void;
  currentPage: number;
}

const PixelCardGrid: React.FC<PixelCardGridProps> = ({
  pixelCards,
  pagination,
  onPageChange,
  currentPage
}) => {
  return (
    <div className="w-full">
      {/* Grid Container */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8">
        {pixelCards.map((pixelCard) => (
          <PixelCardItem 
            key={pixelCard.id} 
            pixelCard={pixelCard} 
          />
        ))}
      </div>

      {/* Pagination Controls */}
      {pagination.totalPages > 1 && (
        <PaginationControls
          currentPage={currentPage}
          totalPages={pagination.totalPages}
          onPageChange={onPageChange}
        />
      )}
    </div>
  );
};

export default PixelCardGrid;