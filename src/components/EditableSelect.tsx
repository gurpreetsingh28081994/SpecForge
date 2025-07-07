import React, { useState } from 'react';
import { ChevronDown, Check } from 'lucide-react';

interface EditableSelectProps {
  value: string;
  options: string[];
  onChange: (value: string) => void;
  className?: string;
}

export const EditableSelect: React.FC<EditableSelectProps> = ({
  value,
  options,
  onChange,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (option: string) => {
    onChange(option);
    setIsOpen(false);
  };

  const getColorClass = (option: string) => {
    switch (option) {
      case 'High': return 'bg-red-100 text-red-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'Low': return 'bg-green-100 text-green-800';
      case 'Feature': return 'bg-blue-100 text-blue-800';
      case 'Bug': return 'bg-red-100 text-red-800';
      case 'Chore': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium cursor-pointer hover:opacity-80 transition-opacity ${getColorClass(value)}`}
      >
        <span>{value}</span>
        <ChevronDown className="w-3 h-3" />
      </button>
      
      {isOpen && (
        <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-24">
          {options.map((option) => (
            <button
              key={option}
              onClick={() => handleSelect(option)}
              className={`w-full text-left px-3 py-2 text-xs hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg flex items-center justify-between ${
                option === value ? 'bg-blue-50' : ''
              }`}
            >
              <span className={`px-2 py-1 rounded-full ${getColorClass(option)}`}>
                {option}
              </span>
              {option === value && <Check className="w-3 h-3 text-blue-600" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};