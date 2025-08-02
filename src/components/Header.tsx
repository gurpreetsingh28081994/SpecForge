import React from 'react';
import { FileText, Zap, Home } from 'lucide-react';

interface HeaderProps {
  onBackToLanding?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onBackToLanding }) => {
  return (
    <header className="bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-white/20 p-2 rounded-lg">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">PRISM</h1>
              <p className="text-blue-100 text-sm">Planning, Requirements, Intelligence, Story Mapping</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            {onBackToLanding && (
              <button
                onClick={onBackToLanding}
                className="flex items-center space-x-2 bg-white/10 px-4 py-2 rounded-full hover:bg-white/20 transition-colors"
              >
                <Home className="w-4 h-4" />
                <span className="text-sm font-medium">Back to Landing</span>
              </button>
            )}
            <div className="flex items-center space-x-2 bg-white/10 px-4 py-2 rounded-full">
              <Zap className="w-4 h-4 text-yellow-300" />
              <span className="text-sm font-medium">Enterprise Ready</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};