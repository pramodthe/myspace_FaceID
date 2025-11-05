import React from 'react';
import { useNavigate } from 'react-router-dom';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();

  const handleCreatePixelID = () => {
    navigate('/create-pixel-id');
  };

  const handleViewGallery = () => {
    navigate('/gallery');
  };

  return (
    <div className="bg-white min-h-screen w-full flex flex-col items-center justify-center p-4 text-black font-mono selection:bg-blue-500 selection:text-white relative pb-10">
      <div className="max-w-md w-full space-y-8 text-center">
        <div className="space-y-4">
          <h1 className="text-4xl font-bold tracking-wider">
            PIXEL ID
          </h1>
          <p className="text-lg text-gray-600 tracking-wide">
            Generate your unique pixel identity card
          </p>
        </div>

        <div className="space-y-6">
          <button
            onClick={handleCreatePixelID}
            className="w-full bg-black text-white py-4 px-8 text-lg font-bold tracking-widest hover:bg-gray-800 transition-colors duration-200 border-2 border-black hover:border-gray-800"
          >
            CREATE PIXEL ID
          </button>

          <div className="grid grid-cols-2 gap-4">
            <button 
              onClick={handleViewGallery}
              className="bg-gray-100 text-black py-3 px-6 font-bold tracking-wider hover:bg-gray-200 transition-colors duration-200 border border-gray-300"
            >
              VIEW GALLERY
            </button>
            <button className="bg-gray-100 text-black py-3 px-6 font-bold tracking-wider hover:bg-gray-200 transition-colors duration-200 border border-gray-300">
              ABOUT
            </button>
          </div>
        </div>
      </div>

      <footer className="absolute bottom-4 text-center w-full text-gray-500 text-sm tracking-widest">
        BUILD WITH LOVE BY NO-SPACE
      </footer>
    </div>
  );
};

export default Dashboard;