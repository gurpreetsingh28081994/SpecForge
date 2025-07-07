import React, { useState } from 'react';
import { Edit2, Check, X } from 'lucide-react';

interface EditableNumberProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  className?: string;
}

export const EditableNumber: React.FC<EditableNumberProps> = ({
  value,
  onChange,
  min = 1,
  max = 21,
  className = ''
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value.toString());

  const handleSave = () => {
    const numValue = parseInt(editValue);
    if (!isNaN(numValue) && numValue >= min && numValue <= max) {
      onChange(numValue);
    } else {
      setEditValue(value.toString());
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditValue(value.toString());
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  if (isEditing) {
    return (
      <div className="flex items-center space-x-1">
        <input
          type="number"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={handleKeyDown}
          className="w-16 p-1 border border-blue-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs text-center"
          min={min}
          max={max}
          autoFocus
        />
        <button
          onClick={handleSave}
          className="p-1 text-green-600 hover:bg-green-50 rounded"
          title="Save"
        >
          <Check className="w-3 h-3" />
        </button>
        <button
          onClick={handleCancel}
          className="p-1 text-red-600 hover:bg-red-50 rounded"
          title="Cancel"
        >
          <X className="w-3 h-3" />
        </button>
      </div>
    );
  }

  return (
    <div
      className={`group cursor-pointer hover:bg-gray-50 rounded p-1 -m-1 transition-colors ${className}`}
      onClick={() => setIsEditing(true)}
    >
      <div className="flex items-center space-x-1">
        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">
          {value} pts
        </span>
        <Edit2 className="w-3 h-3 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
    </div>
  );
};