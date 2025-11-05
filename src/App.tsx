import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import { PixelIDCardGenerator } from './components/generate_pixel';
import { GalleryView, PixelCardDetail } from './components/gallery';
import ErrorBoundary from './components/ErrorBoundary';

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <Router>
        <Routes>
          <Route path="/" element={
            <ErrorBoundary>
              <Dashboard />
            </ErrorBoundary>
          } />
          <Route path="/create-pixel-id" element={
            <ErrorBoundary>
              <main className="bg-white min-h-screen w-full flex flex-col items-center justify-center p-4 text-black font-mono selection:bg-blue-500 selection:text-white relative pb-10">
                <PixelIDCardGenerator />
                
                <footer className="absolute bottom-4 text-center w-full text-gray-500 text-sm tracking-widest">
                  BUILD WITH LOVE BY NO-SPACE
                </footer>
              </main>
            </ErrorBoundary>
          } />
          <Route path="/gallery" element={
            <ErrorBoundary>
              <GalleryView />
            </ErrorBoundary>
          } />
          <Route path="/pixel-card/:id" element={
            <ErrorBoundary>
              <PixelCardDetail />
            </ErrorBoundary>
          } />
        </Routes>
      </Router>
    </ErrorBoundary>
  );
};

export default App;