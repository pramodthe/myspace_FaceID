import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { pixelCardRepository } from '../../services/pixelCardRepository.js';
import type { GalleryResponse } from '../../types/supabase.js';
import PixelCardGrid from './PixelCardGrid.js';
import LoadingSpinner from '../generate_pixel/LoadingSpinner.js';

const GalleryView: React.FC = () => {
  const navigate = useNavigate();
  const [galleryData, setGalleryData] = useState<GalleryResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);

  const loadGalleryData = async (page: number = 1) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const data = await pixelCardRepository.getAllPixelCards({
        page,
        limit: 12
      });
      
      setGalleryData(data);
      setCurrentPage(page);
    } catch (err) {
      console.error('Failed to load gallery:', err);
      setError(err instanceof Error ? err.message : 'Failed to load gallery');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadGalleryData(1);
  }, []);

  const handlePageChange = (page: number) => {
    if (page !== currentPage && galleryData) {
      loadGalleryData(page);
    }
  };

  const handleRetry = () => {
    loadGalleryData(currentPage);
  };

  if (isLoading) {
    return (
      <div className="bg-white min-h-screen w-full flex flex-col items-center justify-center p-4 text-black font-mono selection:bg-blue-500 selection:text-white relative pb-10">
        <div className="mb-6 self-start">
          <button
            onClick={() => navigate('/')}
            className="bg-gray-200 text-black py-2 px-4 font-bold tracking-wider hover:bg-gray-300 transition-colors duration-200 border border-gray-400"
          >
            ← BACK TO DASHBOARD
          </button>
        </div>
        
        <div className="flex flex-col items-center justify-center flex-1">
          <LoadingSpinner />
          <p className="text-black text-xl mt-4 tracking-wider">Loading gallery...</p>
        </div>

        <footer className="absolute bottom-4 text-center w-full text-gray-500 text-sm tracking-widest">
          BUILD WITH LOVE BY NO-SPACE
        </footer>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white min-h-screen w-full flex flex-col items-center justify-center p-4 text-black font-mono selection:bg-blue-500 selection:text-white relative pb-10">
        <div className="mb-6 self-start">
          <button
            onClick={() => navigate('/')}
            className="bg-gray-200 text-black py-2 px-4 font-bold tracking-wider hover:bg-gray-300 transition-colors duration-200 border border-gray-400"
          >
            ← BACK TO DASHBOARD
          </button>
        </div>
        
        <div className="flex flex-col items-center justify-center flex-1 max-w-md text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold mb-4 tracking-wider">GALLERY ERROR</h2>
          <p className="text-gray-600 mb-6 tracking-wide">{error}</p>
          <button
            onClick={handleRetry}
            className="bg-black text-white py-3 px-6 font-bold tracking-wider hover:bg-gray-800 transition-colors duration-200 border-2 border-black hover:border-gray-800"
          >
            TRY AGAIN
          </button>
        </div>

        <footer className="absolute bottom-4 text-center w-full text-gray-500 text-sm tracking-widest">
          BUILD WITH LOVE BY NO-SPACE
        </footer>
      </div>
    );
  }

  if (!galleryData || galleryData.pixelCards.length === 0) {
    return (
      <div className="bg-white min-h-screen w-full flex flex-col items-center justify-center p-4 text-black font-mono selection:bg-blue-500 selection:text-white relative pb-10">
        <div className="mb-6 self-start">
          <button
            onClick={() => navigate('/')}
            className="bg-gray-200 text-black py-2 px-4 font-bold tracking-wider hover:bg-gray-300 transition-colors duration-200 border border-gray-400"
          >
            ← BACK TO DASHBOARD
          </button>
        </div>
        
        <div className="flex flex-col items-center justify-center flex-1 max-w-md text-center">
          <div className="text-6xl mb-4">🎨</div>
          <h2 className="text-2xl font-bold mb-4 tracking-wider">NO PIXEL CARDS YET</h2>
          <p className="text-gray-600 mb-6 tracking-wide">
            The gallery is empty. Create your first pixel ID card to get started!
          </p>
          <button
            onClick={() => navigate('/create-pixel-id')}
            className="bg-black text-white py-3 px-6 font-bold tracking-wider hover:bg-gray-800 transition-colors duration-200 border-2 border-black hover:border-gray-800"
          >
            CREATE PIXEL ID
          </button>
        </div>

        <footer className="absolute bottom-4 text-center w-full text-gray-500 text-sm tracking-widest">
          BUILD WITH LOVE BY NO-SPACE
        </footer>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen w-full flex flex-col p-4 text-black font-mono selection:bg-blue-500 selection:text-white relative pb-10">
      <div className="mb-6">
        <button
          onClick={() => navigate('/')}
          className="bg-gray-200 text-black py-2 px-4 font-bold tracking-wider hover:bg-gray-300 transition-colors duration-200 border border-gray-400"
        >
          ← BACK TO DASHBOARD
        </button>
      </div>

      <div className="flex-1 max-w-6xl mx-auto w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold tracking-wider mb-2">PIXEL GALLERY</h1>
          <p className="text-gray-600 tracking-wide">
            {galleryData.pagination.total} pixel {galleryData.pagination.total === 1 ? 'card' : 'cards'} created
          </p>
        </div>

        <PixelCardGrid 
          pixelCards={galleryData.pixelCards}
          pagination={galleryData.pagination}
          onPageChange={handlePageChange}
          currentPage={currentPage}
        />
      </div>

      <footer className="absolute bottom-4 text-center w-full text-gray-500 text-sm tracking-widest">
        BUILD WITH LOVE BY NO-SPACE
      </footer>
    </div>
  );
};

export default GalleryView;