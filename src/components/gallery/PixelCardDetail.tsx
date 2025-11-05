import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { pixelCardRepository } from '../../services/pixelCardRepository';
import type { PixelCard } from '../../types/supabase';

const PixelCardDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [pixelCard, setPixelCard] = useState<PixelCard | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [imageLoaded, setImageLoaded] = useState<boolean>(false);
  const [imageError, setImageError] = useState<boolean>(false);
  const [copySuccess, setCopySuccess] = useState<boolean>(false);

  useEffect(() => {
    const fetchPixelCard = async () => {
      if (!id) {
        setError('No pixel card ID provided');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        const card = await pixelCardRepository.getPixelCardById(id);
        
        if (!card) {
          setError('Pixel card not found');
        } else {
          setPixelCard(card);
        }
      } catch (err) {
        console.error('Error fetching pixel card:', err);
        setError(err instanceof Error ? err.message : 'Failed to load pixel card');
      } finally {
        setLoading(false);
      }
    };

    fetchPixelCard();
  }, [id]);

  const handleBackToGallery = () => {
    navigate('/gallery');
  };

  const handleShareImage = async () => {
    if (!pixelCard) return;

    try {
      // Try to use Web Share API if available
      if (navigator.share) {
        await navigator.share({
          title: `${pixelCard.userName}'s Pixel ID Card`,
          text: `Check out ${pixelCard.userName}'s pixel ID card!`,
          url: window.location.href
        });
      } else {
        // Fallback: copy URL to clipboard
        await navigator.clipboard.writeText(window.location.href);
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
      }
    } catch (err) {
      console.error('Error sharing:', err);
      // Fallback: try to copy URL to clipboard
      try {
        await navigator.clipboard.writeText(window.location.href);
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
      } catch (clipboardErr) {
        console.error('Error copying to clipboard:', clipboardErr);
      }
    }
  };

  const handleDownloadImage = () => {
    if (!pixelCard) return;

    const link = document.createElement('a');
    link.href = pixelCard.imageUrl;
    link.download = `${pixelCard.userName}-pixel-id.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Loading state
  if (loading) {
    return (
      <div className="bg-white min-h-screen w-full flex flex-col items-center justify-center p-4 text-black font-mono">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin w-8 h-8 border-2 border-gray-400 border-t-black rounded-full"></div>
          <p className="text-lg tracking-wider">LOADING PIXEL CARD...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-white min-h-screen w-full flex flex-col items-center justify-center p-4 text-black font-mono">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="space-y-4">
            <div className="text-6xl">⚠️</div>
            <h1 className="text-2xl font-bold tracking-wider">CARD NOT FOUND</h1>
            <p className="text-gray-600 tracking-wide">{error}</p>
          </div>
          
          <button
            onClick={handleBackToGallery}
            className="w-full bg-black text-white py-3 px-6 font-bold tracking-widest hover:bg-gray-800 transition-colors duration-200 border-2 border-black hover:border-gray-800"
          >
            BACK TO GALLERY
          </button>
        </div>
      </div>
    );
  }

  // Main content
  if (!pixelCard) {
    return null;
  }

  return (
    <div className="bg-white min-h-screen w-full flex flex-col items-center p-4 text-black font-mono selection:bg-blue-500 selection:text-white">
      {/* Header */}
      <div className="w-full max-w-4xl flex justify-between items-center mb-8 pt-4">
        <button
          onClick={handleBackToGallery}
          className="bg-gray-100 text-black py-2 px-4 font-bold tracking-wider hover:bg-gray-200 transition-colors duration-200 border border-gray-300"
        >
          ← BACK TO GALLERY
        </button>
        
        <h1 className="text-2xl font-bold tracking-wider">PIXEL ID CARD</h1>
        
        <div className="w-32"></div> {/* Spacer for centering */}
      </div>

      {/* Main Card Display */}
      <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Image Section */}
        <div className="space-y-4">
          <div className="relative aspect-square bg-gray-100 border-2 border-gray-300 overflow-hidden">
            {!imageLoaded && !imageError && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="animate-spin w-8 h-8 border-2 border-gray-400 border-t-black rounded-full"></div>
              </div>
            )}
            
            {imageError ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500">
                <div className="text-4xl mb-4">⚠️</div>
                <div className="text-lg tracking-wider">IMAGE ERROR</div>
                <div className="text-sm tracking-wide mt-2">Failed to load image</div>
              </div>
            ) : (
              <img
                src={pixelCard.imageUrl}
                alt={`Pixel ID for ${pixelCard.userName}`}
                className={`w-full h-full object-cover transition-opacity duration-300 ${
                  imageLoaded ? 'opacity-100' : 'opacity-0'
                }`}
                onLoad={() => setImageLoaded(true)}
                onError={() => setImageError(true)}
              />
            )}
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={handleShareImage}
              className="bg-blue-500 text-white py-3 px-4 font-bold tracking-wider hover:bg-blue-600 transition-colors duration-200 border-2 border-blue-500 hover:border-blue-600"
            >
              {copySuccess ? '✓ COPIED!' : 'SHARE'}
            </button>
            
            <button
              onClick={handleDownloadImage}
              className="bg-green-500 text-white py-3 px-4 font-bold tracking-wider hover:bg-green-600 transition-colors duration-200 border-2 border-green-500 hover:border-green-600"
            >
              DOWNLOAD
            </button>
          </div>
        </div>

        {/* Details Section */}
        <div className="space-y-6">
          <div className="space-y-4">
            <h2 className="text-3xl font-bold tracking-wider border-b-2 border-gray-300 pb-2">
              {pixelCard.userName.toUpperCase()}
            </h2>
            
            <div className="space-y-3 text-lg">
              <div className="flex justify-between items-center py-2 border-b border-gray-200">
                <span className="text-gray-600 tracking-wide">Card ID:</span>
                <span className="font-mono text-sm tracking-wider break-all">{pixelCard.id}</span>
              </div>
              
              <div className="flex justify-between items-center py-2 border-b border-gray-200">
                <span className="text-gray-600 tracking-wide">Created:</span>
                <span className="tracking-wider text-right">{formatDate(pixelCard.createdAt)}</span>
              </div>
              
              <div className="flex justify-between items-center py-2 border-b border-gray-200">
                <span className="text-gray-600 tracking-wide">File Size:</span>
                <span className="tracking-wider">{formatFileSize(pixelCard.fileSize)}</span>
              </div>
              
              <div className="flex justify-between items-center py-2 border-b border-gray-200">
                <span className="text-gray-600 tracking-wide">Format:</span>
                <span className="tracking-wider">{pixelCard.mimeType.split('/')[1].toUpperCase()}</span>
              </div>
            </div>
          </div>

          {/* Direct Image URL Section */}
          <div className="space-y-3">
            <h3 className="text-xl font-bold tracking-wider">DIRECT IMAGE URL</h3>
            <div className="bg-gray-100 p-4 border border-gray-300">
              <p className="text-sm text-gray-600 tracking-wide mb-2">
                Use this URL to share the image directly:
              </p>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={pixelCard.imageUrl}
                  readOnly
                  className="flex-1 bg-white border border-gray-300 px-3 py-2 text-sm font-mono"
                />
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(pixelCard.imageUrl);
                    setCopySuccess(true);
                    setTimeout(() => setCopySuccess(false), 2000);
                  }}
                  className="bg-gray-600 text-white px-3 py-2 text-sm font-bold tracking-wider hover:bg-gray-700 transition-colors duration-200"
                >
                  COPY
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="text-center w-full text-gray-500 text-sm tracking-widest mt-auto py-4">
        BUILD WITH LOVE BY NO-SPACE
      </footer>
    </div>
  );
};

export default PixelCardDetail;