import React, { useState } from 'react';
import { Plus, Trash2, Edit2, Check, X } from 'lucide-react';

interface EditableListProps {
  items: string[];
  onChange: (items: string[]) => void;
  placeholder?: string;
  addButtonText?: string;
}

export const EditableList: React.FC<EditableListProps> = ({
  items,
  onChange,
  placeholder = 'Enter item...',
  addButtonText = 'Add item'
}) => {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editValue, setEditValue] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [newValue, setNewValue] = useState('');

  const handleEdit = (index: number) => {
    setEditingIndex(index);
    setEditValue(items[index]);
  };

  const handleSave = (index: number) => {
    const newItems = [...items];
    newItems[index] = editValue.trim();
    onChange(newItems);
    setEditingIndex(null);
    setEditValue('');
  };

  const handleCancel = () => {
    setEditingIndex(null);
    setEditValue('');
  };

  const handleDelete = (index: number) => {
    const newItems = items.filter((_, i) => i !== index);
    onChange(newItems);
  };

  const handleAdd = () => {
    if (newValue.trim()) {
      onChange([...items, newValue.trim()]);
      setNewValue('');
      setIsAdding(false);
    }
  };

  const handleCancelAdd = () => {
    setNewValue('');
    setIsAdding(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent, action: () => void) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      action();
    } else if (e.key === 'Escape') {
      if (editingIndex !== null) {
        handleCancel();
      } else {
        handleCancelAdd();
      }
    }
  };

  return (
    <div className="space-y-2">
      {items.map((item, index) => (
        <div key={index} className="flex items-start space-x-2 group">
          {editingIndex === index ? (
            <>
              <input
                type="text"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, () => handleSave(index))}
                className="flex-1 p-2 border border-blue-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                placeholder={placeholder}
                autoFocus
              />
              <button
                onClick={() => handleSave(index)}
                className="p-1 text-green-600 hover:bg-green-50 rounded"
                title="Save"
              >
                <Check className="w-4 h-4" />
              </button>
              <button
                onClick={handleCancel}
                className="p-1 text-red-600 hover:bg-red-50 rounded"
                title="Cancel"
              >
                <X className="w-4 h-4" />
              </button>
            </>
          ) : (
            <>
              <div className="flex-1 flex items-start space-x-2">
                <span className="text-green-500 mt-1 flex-shrink-0">✓</span>
                <span className="text-sm text-gray-600 flex-1">{item}</span>
              </div>
              <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center space-x-1">
                <button
                  onClick={() => handleEdit(index)}
                  className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                  title="Edit"
                >
                  <Edit2 className="w-3 h-3" />
                </button>
                <button
                  onClick={() => handleDelete(index)}
                  className="p-1 text-red-600 hover:bg-red-50 rounded"
                  title="Delete"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </>
          )}
        </div>
      ))}
      
      {isAdding ? (
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={newValue}
            onChange={(e) => setNewValue(e.target.value)}
            onKeyDown={(e) => handleKeyDown(e, handleAdd)}
            className="flex-1 p-2 border border-blue-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            placeholder={placeholder}
            autoFocus
          />
          <button
            onClick={handleAdd}
            className="p-1 text-green-600 hover:bg-green-50 rounded"
            title="Add"
          >
            <Check className="w-4 h-4" />
          </button>
          <button
            onClick={handleCancelAdd}
            className="p-1 text-red-600 hover:bg-red-50 rounded"
            title="Cancel"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          <span>{addButtonText}</span>
        </button>
      )}
    </div>
  );
};