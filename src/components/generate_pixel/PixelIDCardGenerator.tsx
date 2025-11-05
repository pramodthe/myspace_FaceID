import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { pixelateImageWithBackgroundRemoval } from '../../services/geminiService';
import { pixelCardService } from '../../services/pixelCardService';
import { validateImageData } from '../../lib/validation';
import NameInput from './NameInput';
import CameraView from './CameraView';
import FramedPhoto from './FramedPhoto';
import LoadingSpinner from './LoadingSpinner';

type AppStep = 'input' | 'capture' | 'display';

const PixelIDCardGenerator: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<AppStep>('input');
  const [userName, setUserName] = useState<string>('');
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const handleNameSubmit = (name: string) => {
    if (name.trim()) {
      setUserName(name.trim());
      setStep('capture');
      setError(null);
    }
  };

  const handlePhotoCapture = useCallback(async (imageDataUrl: string) => {
    setIsLoading(true);
    setError(null);
    setSaveSuccess(false);
    setSaveError(null);

    try {
      // Validate image data before processing
      const validation = validateImageData.validate(imageDataUrl);
      if (!validation.isValid) {
        throw new Error(`Invalid image: ${validation.errors.join(', ')}`);
      }

      // Generate pixel art
      const pixelatedImageResult = await pixelateImageWithBackgroundRemoval(imageDataUrl);

      // Validate the processed image
      const processedValidation = validateImageData.validate(pixelatedImageResult);
      if (!processedValidation.isValid) {
        throw new Error('Generated image failed validation. Please try again.');
      }

      setProcessedImage(pixelatedImageResult);
      setStep('display');

      // Save the generated pixel card to storage
      try {
        await pixelCardService.savePixelCard({
          userName: userName,
          imageData: pixelatedImageResult
        });
        setSaveSuccess(true);
      } catch (saveErr) {
        console.error('Failed to save pixel card:', saveErr);
        setSaveError(saveErr instanceof Error ? saveErr.message : 'Failed to save pixel card');
      }
    } catch (err) {
      console.error('Failed to generate pixel card:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate pixel card');
      setStep('capture');
    } finally {
      setIsLoading(false);
    }
  }, [userName]);

  const handleRetake = () => {
    setProcessedImage(null);
    setError(null);
    setSaveSuccess(false);
    setSaveError(null);
    setIsLoading(false);
    setStep('capture');
  };

  const handleReset = () => {
    setUserName('');
    setProcessedImage(null);
    setError(null);
    setSaveSuccess(false);
    setSaveError(null);
    setIsLoading(false);
    setStep('input');
  };

  const renderStep = () => {
    switch (step) {
      case 'input':
        return <NameInput onSubmit={handleNameSubmit} />;
      case 'capture':
        return (
          <div className="w-full max-w-md mx-auto">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center h-96 bg-gray-100 rounded-lg text-center p-4 border border-gray-200">
                <LoadingSpinner />
                <p className="text-black text-xl mt-4 tracking-wider font-semibold">Pixelating your image...</p>
                <p className="text-gray-600 text-sm mt-2">This may take a few moments</p>
                <div className="mt-4 bg-blue-50 border border-blue-200 rounded-md p-3 max-w-xs">
                  <p className="text-blue-800 text-xs">
                    💡 Tip: Keep this tab active for faster processing
                  </p>
                </div>
              </div>
            ) : (
              <CameraView onCapture={handlePhotoCapture} />
            )}
            {error && (
              <div className="mt-4 bg-red-50 border border-red-200 rounded-md p-4">
                <div className="flex items-start">
                  <div className="text-red-500 text-xl mr-3">⚠️</div>
                  <div>
                    <p className="text-red-800 font-semibold">Error</p>
                    <p className="text-red-700 text-sm mt-1">{error}</p>
                    <button
                      onClick={() => setError(null)}
                      className="mt-2 text-red-600 hover:text-red-800 text-sm underline"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      case 'display':
        if (processedImage) {
          return (
            <div className="w-full">
              {/* Save feedback messages */}
              {saveSuccess && (
                <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-md text-center">
                  <div className="mb-2">✅ Your pixel card has been saved successfully!</div>
                  <button
                    onClick={() => navigate('/gallery')}
                    className="bg-green-600 text-white py-1 px-3 text-sm font-bold tracking-wider hover:bg-green-700 transition-colors duration-200 border border-green-600"
                  >
                    VIEW GALLERY
                  </button>
                </div>
              )}
              {saveError && (
                <div className="mb-4 p-3 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded-md text-center">
                  ⚠️ Your card was generated but couldn't be saved: {saveError}
                </div>
              )}
              <FramedPhoto 
                imageSrc={processedImage} 
                name={userName} 
                onRetake={handleRetake} 
                onReset={handleReset}
              />
            </div>
          );
        }
        return null;
      default:
        return null;
    }
  };

  return (
    <div className="w-full">
      <div className="mb-6">
        <button
          onClick={() => navigate('/')}
          className="bg-gray-200 text-black py-2 px-4 font-bold tracking-wider hover:bg-gray-300 transition-colors duration-200 border border-gray-400"
        >
          ← BACK TO DASHBOARD
        </button>
      </div>
      {renderStep()}
    </div>
  );
};

export default PixelIDCardGenerator;