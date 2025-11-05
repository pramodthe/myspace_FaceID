import React, { useCallback } from 'react';

interface FramedPhotoProps {
  imageSrc: string;
  name: string;
  onRetake: () => void;
  onReset: () => void;
}

const FramedPhoto: React.FC<FramedPhotoProps> = ({ imageSrc, name, onRetake, onReset }) => {

  const handleDownload = useCallback(() => {
    const link = document.createElement('a');
    link.download = `${name.toLowerCase().replace(/ /g, '_')}_pixel_art.png`;
    link.href = imageSrc;
    link.click();
  }, [name, imageSrc]);

  return (
    <div className="flex flex-col items-center gap-6">
        <div className="bg-white text-black p-4 border-8 border-blue-200 rounded-3xl w-full max-w-sm mx-auto shadow-[0_0_20px_8px_rgba(147,197,253,0.6)]">
            {/* Header */}
            <div className="flex items-center justify-center my-2">
                <span className="mx-4 text-2xl tracking-widest uppercase text-center">{name}</span>
            </div>

            {/* Image */}
            <div className="border border-gray-300 p-1 aspect-square bg-white">
                <img 
                    src={imageSrc} 
                    alt="Pixelated capture" 
                    className="w-full h-full object-contain transform -scale-x-100" // Use object-contain to respect transparency
                    style={{ imageRendering: 'pixelated' }} // CSS for crisp edges
                />
            </div>

            {/* Footer Section */}
            <div className="border border-gray-300 mt-3 p-1 flex items-stretch gap-1 text-xs rounded-lg">
                <div className="bg-gray-100 p-2 text-center leading-tight w-2/5 rounded-md flex items-center justify-center uppercase">
                    <span className="break-words">BUILD WITH LOVE ❤️ BY NO-SPACE</span>
                </div>
                <div className="p-2 text-center leading-tight w-3/5 break-words flex items-center justify-center uppercase">
                    <span className="font-semibold tracking-wider">Scan My ID Using No-Space App 📱</span>
                </div>
            </div>
            <div className="h-1.5 bg-blue-200 rounded-full mt-2 mx-4"></div>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4">
            <button
                onClick={onRetake}
                className="bg-blue-600 text-white text-lg font-bold py-2 px-6 rounded-md hover:bg-blue-500 active:bg-blue-700 transition-all duration-200"
            >
                Retake
            </button>
             <button
                onClick={onReset}
                className="bg-gray-800 text-white text-lg font-bold py-2 px-6 rounded-md hover:bg-gray-700 active:bg-gray-900 transition-all duration-200"
            >
                Start Over
            </button>
            <button
                onClick={handleDownload}
                className="bg-green-600 text-white text-lg font-bold py-2 px-6 rounded-md hover:bg-green-500 active:bg-green-700 transition-all duration-200"
            >
                Download 💾
            </button>
        </div>
    </div>
  );
};

export default FramedPhoto;