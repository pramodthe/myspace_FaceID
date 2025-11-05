
import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: 'blue' | 'gray' | 'green' | 'red';
  message?: string;
  className?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  color = 'blue', 
  message,
  className = ''
}) => {
  const sizeClasses = {
    sm: 'w-6 h-6 border-2',
    md: 'w-16 h-16 border-4',
    lg: 'w-24 h-24 border-6'
  };

  const colorClasses = {
    blue: 'border-blue-500',
    gray: 'border-gray-500',
    green: 'border-green-500',
    red: 'border-red-500'
  };

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <div 
        className={`border-dashed rounded-full animate-spin ${sizeClasses[size]} ${colorClasses[color]}`}
        role="status"
        aria-label="Loading"
      />
      {message && (
        <p className="mt-3 text-gray-600 text-center tracking-wide">
          {message}
        </p>
      )}
    </div>
  );
};

export default LoadingSpinner;