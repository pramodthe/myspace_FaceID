import React, { useRef, useEffect, useCallback, useState } from 'react';
import { validateImageData, VALIDATION_LIMITS } from '../../lib/validation';

interface CameraViewProps {
  onCapture: (imageDataUrl: string) => void;
}

const CameraView: React.FC<CameraViewProps> = ({ onCapture }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [permissionDenied, setPermissionDenied] = useState(false);

  const startCamera = useCallback(async () => {
    try {
      setError(null);
      setPermissionDenied(false);
      setCameraReady(false);

      // Check if getUserMedia is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera access is not supported in this browser');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'user', 
          width: { ideal: 480, min: 320 }, 
          height: { ideal: 640, min: 240 } 
        },
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          setCameraReady(true);
        };
      }
    } catch (err) {
      console.error('Camera error:', err);
      
      // Set component state
      if (err instanceof Error) {
        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
          setPermissionDenied(true);
        }
        setError(err.message);
      } else {
        setError('Failed to access camera');
      }
    }
  }, []);

  useEffect(() => {
    startCamera();
    return () => {
      // Cleanup: stop camera stream when component unmounts
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [startCamera]);

  const capturePhoto = async () => {
    if (!videoRef.current || !canvasRef.current || !cameraReady) {
      setError("Camera is not ready. Please wait a moment and try again.");
      return;
    }

    setIsCapturing(true);
    setError(null);

    try {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      const context = canvas.getContext('2d');
      if (!context) {
        throw new Error('Could not get canvas context');
      }

      const videoWidth = video.videoWidth;
      const videoHeight = video.videoHeight;
      
      if (videoWidth === 0 || videoHeight === 0) {
        throw new Error('Invalid video dimensions. Please ensure camera is working properly.');
      }
      
      // Crop to a square from the center of the video stream
      const size = Math.min(videoWidth, videoHeight);
      const sx = (videoWidth - size) / 2;
      const sy = (videoHeight - size) / 2;

      canvas.width = size;
      canvas.height = size;
      
      context.drawImage(video, sx, sy, size, size, 0, 0, size, size);
      
      // Generate image data with quality settings
      const dataUrl = canvas.toDataURL('image/png', 0.9);
      
      // Validate the captured image
      const validation = validateImageData.validate(dataUrl);
      if (!validation.isValid) {
        throw new Error(`Image validation failed: ${validation.errors.join(', ')}`);
      }

      // Check estimated file size
      const base64Data = dataUrl.split(',')[1];
      const estimatedSize = (base64Data.length * 3) / 4;
      
      if (estimatedSize > VALIDATION_LIMITS.IMAGE_MAX_SIZE_BYTES) {
        throw new Error(`Image is too large (${Math.round(estimatedSize / (1024 * 1024))}MB). Maximum allowed size is ${VALIDATION_LIMITS.IMAGE_MAX_SIZE_BYTES / (1024 * 1024)}MB.`);
      }

      // Success - pass the validated image to parent
      onCapture(dataUrl);
      
    } catch (err) {
      console.error('Error capturing photo:', err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to capture photo. Please try again.');
      }
    } finally {
      setIsCapturing(false);
    }
  };
  
  if (error) {
    return (
      <div className="w-full aspect-square bg-gray-100 rounded-lg flex flex-col items-center justify-center text-center p-4 border border-gray-200">
        <div className="text-6xl mb-4">📷</div>
        <p className="text-red-600 font-semibold mb-2">Camera Error</p>
        <p className="text-red-500 text-sm mb-4">{error}</p>
        
        {permissionDenied ? (
          <div className="space-y-2">
            <button 
              onClick={startCamera} 
              className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-500 font-bold tracking-wider transition-colors duration-200"
            >
              TRY AGAIN
            </button>
            <div className="text-xs text-gray-600 max-w-xs">
              If the problem persists, check your browser settings to allow camera access for this site.
            </div>
          </div>
        ) : (
          <button 
            onClick={startCamera} 
            className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-500 font-bold tracking-wider transition-colors duration-200"
          >
            RETRY
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto flex flex-col items-center gap-4">
      <div className="w-full aspect-square rounded-lg overflow-hidden bg-gray-100 relative border-4 border-gray-300">
        {!cameraReady && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-200">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
              <p className="text-gray-600 text-sm">Starting camera...</p>
            </div>
          </div>
        )}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={`w-full h-full object-cover transform -scale-x-100 transition-opacity duration-300 ${
            cameraReady ? 'opacity-100' : 'opacity-0'
          }`}
        />
        
        {/* Camera overlay guide */}
        {cameraReady && (
          <div className="absolute inset-0 pointer-events-none">
            <div className="w-full h-full border-2 border-dashed border-white/50 rounded-lg flex items-center justify-center">
              <div className="text-white/80 text-center bg-black/30 rounded-lg p-2">
                <div className="text-sm font-semibold">Position your face</div>
                <div className="text-xs">in the center</div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      <canvas ref={canvasRef} className="hidden" />
      
      <button
        onClick={capturePhoto}
        disabled={!cameraReady || isCapturing}
        className={`w-full text-2xl font-bold py-4 px-6 rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white ${
          cameraReady && !isCapturing
            ? 'bg-blue-600 text-white hover:bg-blue-500 active:bg-blue-700 transform hover:scale-105 active:scale-100 focus:ring-blue-500 cursor-pointer'
            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
        }`}
      >
        {isCapturing ? (
          <div className="flex items-center justify-center gap-2">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            Capturing...
          </div>
        ) : (
          'Capture 📸'
        )}
      </button>
      
      {/* Help text */}
      <div className="text-xs text-gray-500 text-center max-w-xs">
        Make sure your face is well-lit and centered in the frame for the best results.
      </div>
    </div>
  );
};

export default CameraView;