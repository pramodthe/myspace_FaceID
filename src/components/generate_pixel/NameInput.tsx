import React, { useState, useEffect } from 'react';
import { validateUserName, sanitizeUserName, VALIDATION_LIMITS } from '../../lib/validation';

interface NameInputProps {
  onSubmit: (name: string) => void;
}

const NameInput: React.FC<NameInputProps> = ({ onSubmit }) => {
  const [name, setName] = useState('');
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [isValid, setIsValid] = useState(false);
  const [showErrors, setShowErrors] = useState(false);

  // Validate name in real-time
  useEffect(() => {
    if (name.length > 0) {
      const validation = validateUserName.validate(name);
      setValidationErrors(validation.errors);
      setIsValid(validation.isValid);
    } else {
      setValidationErrors([]);
      setIsValid(false);
    }
  }, [name]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    // Apply basic sanitization while typing
    const sanitized = value.substring(0, VALIDATION_LIMITS.USER_NAME_MAX_LENGTH);
    setName(sanitized);
    
    // Hide errors while user is typing, show them after they stop
    setShowErrors(false);
  };

  const handleInputBlur = () => {
    // Show validation errors when user leaves the input field
    if (name.length > 0) {
      setShowErrors(true);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowErrors(true);

    if (isValid && name.trim()) {
      const sanitizedName = sanitizeUserName(name);
      onSubmit(sanitizedName);
    }
  };

  const remainingChars = VALIDATION_LIMITS.USER_NAME_MAX_LENGTH - name.length;
  const isNearLimit = remainingChars <= 10;

  return (
    <div className="w-full max-w-sm mx-auto flex flex-col items-center">
      <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
        <label htmlFor="name" className="text-lg text-center text-gray-700">
          Enter your name:
        </label>
        
        <div className="relative">
          <input
            id="name"
            type="text"
            value={name}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
            placeholder="e.g. Claire"
            className={`w-full bg-white border-2 text-black text-center text-xl p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white transition-all duration-200 ${
              showErrors && !isValid && name.length > 0
                ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                : isValid && name.length > 0
                ? 'border-green-500 focus:border-green-500 focus:ring-green-500'
                : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
            }`}
            required
            maxLength={VALIDATION_LIMITS.USER_NAME_MAX_LENGTH}
            autoComplete="given-name"
            spellCheck="false"
          />
          
          {/* Character counter */}
          <div className={`text-xs text-right mt-1 ${isNearLimit ? 'text-orange-600' : 'text-gray-500'}`}>
            {name.length}/{VALIDATION_LIMITS.USER_NAME_MAX_LENGTH}
          </div>
        </div>

        {/* Validation errors */}
        {showErrors && validationErrors.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3">
            <div className="text-red-800 text-sm">
              <div className="font-semibold mb-1">Please fix the following:</div>
              <ul className="list-disc list-inside space-y-1">
                {validationErrors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Success indicator */}
        {isValid && name.length > 0 && (
          <div className="bg-green-50 border border-green-200 rounded-md p-2">
            <div className="text-green-800 text-sm text-center">
              ✓ Name looks good!
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={!isValid || name.trim().length === 0}
          className={`text-xl font-bold py-3 px-6 rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white ${
            isValid && name.trim().length > 0
              ? 'bg-blue-600 text-white hover:bg-blue-500 active:bg-blue-700 transform hover:scale-105 active:scale-100 focus:ring-blue-500 cursor-pointer'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          Next →
        </button>
      </form>
      
      {/* Help text */}
      <div className="mt-4 text-xs text-gray-500 text-center max-w-xs">
        Use letters, numbers, spaces, hyphens, underscores, apostrophes, and periods only.
      </div>
    </div>
  );
};

export default NameInput;