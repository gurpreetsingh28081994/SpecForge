import React, { useState, useImperativeHandle, forwardRef, useEffect } from 'react';
import { FileText, Sparkles } from 'lucide-react';

interface TextInputProps {
  onAnalyze: (text: string) => void;
  isLoading: boolean;
  initialValue?: string;
}

export interface TextInputHandle {
  setValue: (v: string) => void;
  analyze: () => void;
}

export const TextInput = forwardRef<TextInputHandle, TextInputProps>(
  ({ onAnalyze, isLoading, initialValue = '' }, ref) => {
    const [text, setText] = useState(initialValue);
    const [wordCount, setWordCount] = useState(0);

    useEffect(() => {
      setText(initialValue);
      setWordCount(initialValue.trim().split(/\s+/).filter(word => word.length > 0).length);
    }, [initialValue]);

    useImperativeHandle(ref, () => ({
      setValue: (v: string) => {
        setText(v);
        setWordCount(v.trim().split(/\s+/).filter(word => word.length > 0).length);
      },
      analyze: () => {
        handleAnalyze();
      },
    }));

    const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newText = e.target.value;
      setText(newText);
      setWordCount(newText.trim().split(/\s+/).filter(word => word.length > 0).length);
    };

    const handleAnalyze = () => {
      if (text.trim()) {
        onAnalyze(text.trim());
      }
    };

    const sampleText = `The app must allow users to sign up using Google or email.\nOnce signed in, users can create and share AI-generated art.\nAdmins should be able to moderate shared content.\nThe app must be mobile-responsive and support dark mode.\nUsers can download art in PNG or JPG format.\nThe system should provide analytics for user engagement.\nPayment integration is required for premium features.`;

    const loadSample = () => {
      setText(sampleText);
      setWordCount(sampleText.trim().split(/\s+/).length);
    };

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-700 flex items-center space-x-2">
            <FileText className="w-5 h-5" />
            <span>Requirements Text</span>
          </h3>
          <button
            onClick={loadSample}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            Load Sample
          </button>
        </div>
        <textarea
          value={text}
          onChange={handleTextChange}
          placeholder={`Paste your software requirements here...\n\nExample:\n- The app must allow users to sign up using Google or email\n- Users can create and share AI-generated art\n- Admins should be able to moderate shared content\n- The app must be mobile-responsive and support dark mode`}
          className="w-full h-48 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
        />
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500">
            {wordCount} words
          </div>
          <button
            onClick={handleAnalyze}
            disabled={!text.trim() || isLoading}
            className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <Sparkles className="w-5 h-5" />
            <span>{isLoading ? 'Analyzing...' : 'Generate Stories'}</span>
          </button>
        </div>
      </div>
    );
  }
);