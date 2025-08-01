import React from 'react';

interface OptionBubblesProps {
  options: string[];
  onSelect: (option: string) => void;
  disabled?: boolean;
}

const OptionBubbles: React.FC<OptionBubblesProps> = ({ options, onSelect, disabled }) => {
  return (
    <div className="flex flex-wrap gap-2 mt-2">
      {options.map((option) => (
        <button
          key={option}
          className="bg-blue-100 hover:bg-blue-600 hover:text-white text-blue-800 rounded-full px-4 py-2 text-sm font-medium transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-blue-400"
          onClick={() => onSelect(option)}
          disabled={disabled}
          style={{ opacity: disabled ? 0.6 : 1, cursor: disabled ? 'not-allowed' : 'pointer' }}
        >
          {option.replace(/_/g, ' ')}
        </button>
      ))}
    </div>
  );
};

export default OptionBubbles;
