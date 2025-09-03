
import React from 'react';

interface ControlsProps {
  onAdvanceTime: () => void;
  isLoading: boolean;
}

export const Controls: React.FC<ControlsProps> = ({ onAdvanceTime, isLoading }) => {
  return (
    <div className="flex flex-col items-center justify-center">
      <button
        onClick={onAdvanceTime}
        disabled={isLoading}
        className="w-full max-w-sm text-2xl bg-green-900/80 text-yellow-400 border-2 border-green-600 px-8 py-3 
                   hover:bg-green-800/80 hover:text-yellow-300 transition-all duration-300 
                   disabled:bg-gray-700 disabled:text-gray-400 disabled:cursor-not-allowed disabled:border-gray-500
                   relative overflow-hidden"
      >
        {isLoading && <div className="absolute top-0 left-0 h-full bg-cyan-400/50 scanner-bar"></div>}
        <span className="relative z-10">{isLoading ? 'SCANNING...' : '>> ADVANCE TIME <<'}</span>
      </button>
    </div>
  );
};