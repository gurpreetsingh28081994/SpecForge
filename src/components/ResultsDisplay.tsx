import React, { useState } from 'react';
import { Copy, Download, ChevronDown, ChevronRight, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { JiraOutput } from '../types/jira';
import { EditableText } from './EditableText';
import { EditableList } from './EditableList';
import { EditableSelect } from './EditableSelect';
import { EditableNumber } from './EditableNumber';

interface ResultsDisplayProps {
  results: JiraOutput;
  onResultsChange: (results: JiraOutput) => void;
}

export const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ results, onResultsChange }) => {
  const [expandedEpics, setExpandedEpics] = useState<Set<number>>(new Set());
  const [expandedStories, setExpandedStories] = useState<Set<string>>(new Set());
  const [copiedToClipboard, setCopiedToClipboard] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [importText, setImportText] = useState('');
  const [importError, setImportError] = useState('');

  const toggleEpic = (index: number) => {
    const newExpanded = new Set(expandedEpics);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedEpics(newExpanded);
  };

  const toggleStory = (storyId: string) => {
    const newExpanded = new Set(expandedStories);
    if (newExpanded.has(storyId)) {
      newExpanded.delete(storyId);
    } else {
      newExpanded.add(storyId);
    }
    setExpandedStories(newExpanded);
  };

  const updateEpic = (epicIndex: number, field: string, value: any) => {
    const newResults = { ...results };
    (newResults.epics[epicIndex] as any)[field] = value;
    
    // Recalculate metadata
    const totalStories = newResults.epics.reduce((sum, epic) => sum + epic.stories.length, 0);
    const totalPoints = newResults.epics.reduce((sum, epic) => 
      sum + epic.stories.reduce((storySum, story) => storySum + story.story_points, 0), 0);
    
    newResults.metadata = {
      ...newResults.metadata,
      total_stories: totalStories,
      estimated_total_points: totalPoints
    };
    
    onResultsChange(newResults);
  };

  const updateStory = (epicIndex: number, storyIndex: number, field: string, value: any) => {
    const newResults = { ...results };
    (newResults.epics[epicIndex].stories[storyIndex] as any)[field] = value;
    
    // Recalculate metadata if story points changed
    if (field === 'story_points') {
      const totalPoints = newResults.epics.reduce((sum, epic) => 
        sum + epic.stories.reduce((storySum, story) => storySum + story.story_points, 0), 0);
      newResults.metadata.estimated_total_points = totalPoints;
    }
    
    onResultsChange(newResults);
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(results, null, 2));
      setCopiedToClipboard(true);
      setTimeout(() => setCopiedToClipboard(false), 2000);
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  };

  const downloadJson = () => {
    const blob = new Blob([JSON.stringify(results, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `jira-stories-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportJson = () => {
    setShowImport(true);
    setImportText('');
    setImportError('');
  };

  const handleImportSubmit = () => {
    try {
      const parsed = JSON.parse(importText);
      if (!parsed.epics || !parsed.metadata) {
        setImportError('Invalid JSON: missing required fields.');
        return;
      }
      setImportError('');
      setShowImport(false);
      onResultsChange(parsed);
    } catch (e) {
      setImportError('Invalid JSON format.');
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'bg-red-100 text-red-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'Low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'High': return <AlertCircle className="w-3 h-3" />;
      case 'Medium': return <Clock className="w-3 h-3" />;
      case 'Low': return <CheckCircle className="w-3 h-3" />;
      default: return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <div className="flex items-center justify-between p-6 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Generated JIRA Stories</h2>
          <div className="flex items-center space-x-6 mt-2 text-sm text-gray-600">
            <span className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>{results.metadata.total_epics} Epics</span>
            </span>
            <span className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>{results.metadata.total_stories} Stories</span>
            </span>
            <span className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <span>{results.metadata.estimated_total_points} Story Points</span>
            </span>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={copyToClipboard}
            className="inline-flex items-center space-x-2 bg-white text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 border transition-colors"
          >
            <Copy className="w-4 h-4" />
            <span>{copiedToClipboard ? 'Copied!' : 'Copy JSON'}</span>
          </button>
          <button
            onClick={downloadJson}
            className="inline-flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Download</span>
          </button>
          <button
            onClick={handleImportJson}
            className="inline-flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            <span>Import JSON</span>
          </button>
        </div>
      </div>

      {/* Import JSON Modal */}
      {showImport && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-lg">
            <h3 className="text-lg font-semibold mb-2">Import JIRA Stories JSON</h3>
            <textarea
              className="w-full h-40 p-2 border border-gray-300 rounded mb-2"
              value={importText}
              onChange={e => setImportText(e.target.value)}
              placeholder="Paste your JSON here..."
            />
            {importError && <div className="text-red-600 text-sm mb-2">{importError}</div>}
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowImport(false)}
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
              >Cancel</button>
              <button
                onClick={handleImportSubmit}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >Import</button>
            </div>
          </div>
        </div>
      )}

      {/* Epics and Stories */}
      <div className="space-y-4">
        {results.epics.map((epic, epicIndex) => (
          <div key={epicIndex} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            {/* Epic Header */}
            <div 
              className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 border-b cursor-pointer hover:from-indigo-100 hover:to-purple-100 transition-colors"
              onClick={() => toggleEpic(epicIndex)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="text-indigo-600">
                    {expandedEpics.has(epicIndex) ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                  </div>
                  <div>
                    <EditableText
                      value={epic.title}
                      onChange={(value) => updateEpic(epicIndex, 'title', value)}
                      className="text-lg font-semibold text-gray-800"
                      placeholder="Epic title..."
                    />
                    <div className="mt-1">
                      <EditableText
                        value={epic.description}
                        onChange={(value) => updateEpic(epicIndex, 'description', value)}
                        className="text-sm text-gray-600"
                        multiline
                        placeholder="Epic description..."
                      />
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm font-medium">
                    {epic.stories.length} stories
                  </span>
                  <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium">
                    {epic.stories.reduce((sum, story) => sum + story.story_points, 0)} points
                  </span>
                </div>
              </div>
            </div>

            {/* Epic Content */}
            {expandedEpics.has(epicIndex) && (
              <div className="p-4 space-y-4">
                {/* Features */}
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">Features:</h4>
                  <EditableList
                    items={epic.features}
                    onChange={(features) => updateEpic(epicIndex, 'features', features)}
                    placeholder="Enter feature..."
                    addButtonText="Add feature"
                  />
                </div>

                {/* Stories */}
                <div>
                  <h4 className="font-medium text-gray-700 mb-3">User Stories:</h4>
                  <div className="space-y-3">
                    {epic.stories.map((story, storyIndex) => {
                      const storyId = `${epicIndex}-${storyIndex}`;
                      return (
                        <div key={storyIndex} className="bg-gray-50 rounded-lg border">
                          <div 
                            className="p-4 cursor-pointer hover:bg-gray-100 transition-colors"
                            onClick={() => toggleStory(storyId)}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3 flex-1">
                                <div className="text-gray-400">
                                  {expandedStories.has(storyId) ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                                </div>
                                <div className="flex-1">
                                  <EditableText
                                    value={story.title}
                                    onChange={(value) => updateStory(epicIndex, storyIndex, 'title', value)}
                                    className="font-medium text-gray-800"
                                    placeholder="Story title..."
                                  />
                                  <div className="mt-1">
                                    <EditableText
                                      value={story.description}
                                      onChange={(value) => updateStory(epicIndex, storyIndex, 'description', value)}
                                      className="text-sm text-gray-600"
                                      multiline
                                      placeholder="Story description..."
                                    />
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <EditableSelect
                                  value={story.priority}
                                  options={['High', 'Medium', 'Low']}
                                  onChange={(value) => updateStory(epicIndex, storyIndex, 'priority', value)}
                                />
                                <EditableNumber
                                  value={story.story_points}
                                  onChange={(value) => updateStory(epicIndex, storyIndex, 'story_points', value)}
                                  min={1}
                                  max={21}
                                />
                              </div>
                            </div>
                          </div>

                          {/* Story Details */}
                          {expandedStories.has(storyId) && (
                            <div className="px-4 pb-4 border-t bg-white">
                              <div className="pt-4 space-y-3">
                                <div>
                                  <h6 className="font-medium text-gray-700 mb-2">Acceptance Criteria:</h6>
                                  <EditableList
                                    items={story.acceptance_criteria}
                                    onChange={(criteria) => updateStory(epicIndex, storyIndex, 'acceptance_criteria', criteria)}
                                    placeholder="Given/When/Then criteria..."
                                    addButtonText="Add criteria"
                                  />
                                </div>
                                <div className="flex items-center space-x-4 text-sm">
                                  <div className="flex items-center space-x-2">
                                    <span className="text-gray-500">Type:</span>
                                    <EditableSelect
                                      value={story.type}
                                      options={['Feature', 'Bug', 'Chore']}
                                      onChange={(value) => updateStory(epicIndex, storyIndex, 'type', value)}
                                    />
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <span className="text-gray-500">Points:</span>
                                    <span className="text-gray-700">{story.story_points}</span>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <span className="text-gray-500">Priority:</span>
                                    <span className="text-gray-700">{story.priority}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Metadata */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="font-medium text-gray-700 mb-2">Generation Summary</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-gray-500">Total Epics:</span>
            <span className="ml-2 font-medium">{results.metadata.total_epics}</span>
          </div>
          <div>
            <span className="text-gray-500">Total Stories:</span>
            <span className="ml-2 font-medium">{results.metadata.total_stories}</span>
          </div>
          <div>
            <span className="text-gray-500">Total Points:</span>
            <span className="ml-2 font-medium">{results.metadata.estimated_total_points}</span>
          </div>
          <div>
            <span className="text-gray-500">Generated:</span>
            <span className="ml-2 font-medium">{new Date(results.metadata.generated_at).toLocaleDateString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
};