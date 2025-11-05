import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { PixelCardResponse } from '../../types/supabase';

interface PixelCardItemProps {
  pixelCard: PixelCardResponse;
}

const PixelCardItem: React.FC<PixelCardItemProps> = ({ pixelCard }) => {
  const navigate = useNavigate();
  const [imageLoaded, setImageLoaded] = useState<boolean>(false);
  const [imageError, setImageError] = useState<boolean>(false);

  const handleCardClick = () => {
    navigate(`/pixel-card/${pixelCard.id}`);
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div 
      className="bg-white border-2 border-gray-300 hover:border-black transition-all duration-200 cursor-pointer group"
      onClick={handleCardClick}
    >
      {/* Image Container */}
      <div className="relative aspect-square bg-gray-100 overflow-hidden">
        {!imageLoaded && !imageError && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="animate-spin w-6 h-6 border-2 border-gray-400 border-t-black rounded-full"></div>
          </div>
        )}
        
        {imageError ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500">
            <div className="text-2xl mb-2">⚠️</div>
            <div className="text-xs tracking-wider">IMAGE ERROR</div>
          </div>
        ) : (
          <img
            src={pixelCard.imageUrl}
            alt={`Pixel ID for ${pixelCard.userName}`}
            className={`w-full h-full object-cover transition-all duration-200 group-hover:scale-105 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageError(true)}
            loading="lazy"
          />
        )}
        
        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center">
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-white font-bold tracking-wider text-sm">
            VIEW CARD
          </div>
        </div>
      </div>

      {/* Card Info */}
      <div className="p-4 space-y-2">
        <h3 className="font-bold tracking-wider text-lg truncate">
          {pixelCard.userName.toUpperCase()}
        </h3>
        
        <div className="space-y-1 text-sm text-gray-600">
          <div className="flex justify-between items-center">
            <span className="tracking-wide">Created:</span>
            <span className="tracking-wider">{formatDate(pixelCard.createdAt)}</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="tracking-wide">Size:</span>
            <span className="tracking-wider">{formatFileSize(pixelCard.fileSize)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PixelCardItem;