import React, { useState } from 'react';
import { Header } from './components/Header';
import { FileUpload } from './components/FileUpload';
import { TextInput } from './components/TextInput';
import { ResultsDisplay } from './components/ResultsDisplay';
import { ArchitectureDisplay } from './components/ArchitectureDisplay';
import { TestingDisplay } from './components/TestingDisplay';
import { RequirementsParser } from './utils/requirementsParser';
import { ArchitectureAnalyzer } from './utils/architectureAnalyzer';
import { TestingAnalyzer } from './utils/testingAnalyzer';
import { JiraOutput } from './types/jira';
import { ArchitectureOutput } from './types/architecture';
import { TestingOutput } from './types/testing';

function App() {
  const [results, setResults] = useState<JiraOutput | null>(null);
  const [architectureResults, setArchitectureResults] = useState<ArchitectureOutput | null>(null);
  const [testingResults, setTestingResults] = useState<TestingOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'text' | 'upload'>('text');
  const [analysisMode, setAnalysisMode] = useState<'jira' | 'architecture' | 'testing'>('jira');

  const handleAnalyze = async (text: string) => {
    setIsLoading(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    try {
      if (analysisMode === 'jira') {
        const analysisResult = RequirementsParser.analyzeRequirements(text);
        setResults(analysisResult);
        setArchitectureResults(null);
        setTestingResults(null);
      } else if (analysisMode === 'architecture') {
        const architectureResult = ArchitectureAnalyzer.analyzeArchitecture(text);
        setArchitectureResults(architectureResult);
        setResults(null);
        setTestingResults(null);
      } else if (analysisMode === 'testing') {
        const testingResult = TestingAnalyzer.analyzeForTesting(text);
        setTestingResults(testingResult);
        setResults(null);
        setArchitectureResults(null);
      }
    } catch (error) {
      console.error('Analysis failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = (content: string) => {
    handleAnalyze(content);
  };

  const handleReset = () => {
    setResults(null);
    setArchitectureResults(null);
    setTestingResults(null);
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container mx-auto px-6 py-8">
        {!results && !architectureResults && !testingResults ? (
          <div className="max-w-4xl mx-auto">
            {/* Introduction */}
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-800 mb-4">
                {analysisMode === 'jira'
                  ? 'Transform Requirements into JIRA Stories'
                  : analysisMode === 'architecture'
                  ? 'Generate System Architecture & Tech Stack'
                  : 'Generate QA Test Plans & Test Cases'
                }
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                {analysisMode === 'jira'
                  ? 'Upload your requirements document or paste text to automatically generate well-structured JIRA epics and user stories with acceptance criteria.'
                  : analysisMode === 'architecture'
                  ? 'Analyze your software requirements to generate comprehensive architecture diagrams, technology stack recommendations, and deployment strategies.'
                  : 'Transform your requirements into comprehensive test plans, detailed test cases, automation strategies, and QA metrics for enterprise-grade testing.'
                }
              </p>
            </div>

            {/* Analysis Mode Toggle */}
            <div className="flex justify-center mb-8">
              <div className="bg-gray-100 p-1 rounded-lg flex">
                <button
                  onClick={() => setAnalysisMode('jira')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    analysisMode === 'jira'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  JIRA Stories
                </button>
                <button
                  onClick={() => setAnalysisMode('architecture')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    analysisMode === 'architecture'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  Architecture Design
                </button>
                <button
                  onClick={() => setAnalysisMode('testing')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    analysisMode === 'testing'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  QA Testing
                </button>
              </div>
            </div>

            {/* Input Methods */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              {/* Tab Navigation */}
              <div className="border-b border-gray-200">
                <nav className="flex space-x-8 px-6">
                  <button
                    onClick={() => setActiveTab('text')}
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'text'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    Text Input
                  </button>
                  <button
                    onClick={() => setActiveTab('upload')}
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'upload'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    File Upload
                  </button>
                </nav>
              </div>

              {/* Tab Content */}
              <div className="p-6">
                {activeTab === 'text' ? (
                  <TextInput onAnalyze={handleAnalyze} isLoading={isLoading} />
                ) : (
                  <FileUpload onFileUpload={handleFileUpload} />
                )}
              </div>
            </div>

            {/* Loading State */}
            {isLoading && (
              <div className="mt-8 text-center">
                <div className="inline-flex items-center space-x-3 bg-white px-6 py-4 rounded-lg shadow-sm border">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  <span className="text-gray-700">
                    {analysisMode === 'jira'
                      ? 'Analyzing requirements and generating stories...'
                      : analysisMode === 'architecture'
                      ? 'Analyzing requirements and generating architecture...'
                      : 'Analyzing requirements and generating test plans...'
                    }
                  </span>
                </div>
              </div>
            )}

            {/* Features */}
            {analysisMode === 'jira' ? (
              <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Smart Analysis</h3>
                  <p className="text-gray-600">
                    AI-powered analysis automatically categorizes requirements into logical epics and user stories.
                  </p>
                </div>
                <div className="text-center">
                  <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">JIRA Ready</h3>
                  <p className="text-gray-600">
                    Generate JSON output that's directly compatible with JIRA's REST API for seamless import.
                  </p>
                </div>
                <div className="text-center">
                  <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Agile Compliant</h3>
                  <p className="text-gray-600">
                    Automatically generates acceptance criteria in Gherkin format with proper story point estimation.
                  </p>
                </div>
              </div>
            ) : analysisMode === 'architecture' ? (
              <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="bg-indigo-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Architecture Diagrams</h3>
                  <p className="text-gray-600">
                    Generate high-level and low-level architecture diagrams in Mermaid.js and PlantUML formats.
                  </p>
                </div>
                <div className="text-center">
                  <div className="bg-emerald-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Tech Stack Recommendations</h3>
                  <p className="text-gray-600">
                    Get curated technology recommendations based on project complexity and requirements.
                  </p>
                </div>
                <div className="text-center">
                  <div className="bg-cyan-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Deployment Strategy</h3>
                  <p className="text-gray-600">
                    Receive deployment recommendations and CI/CD pipeline suggestions tailored to your project.
                  </p>
                </div>
              </div>
            ) : (
              <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Comprehensive Test Plans</h3>
                  <p className="text-gray-600">
                    Generate detailed test plans with entry/exit criteria, risk analysis, and testing strategies.
                  </p>
                </div>
                <div className="text-center">
                  <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Detailed Test Cases</h3>
                  <p className="text-gray-600">
                    Auto-generate test cases with steps, expected results, and JIRA-compatible formats.
                  </p>
                </div>
                <div className="text-center">
                  <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Automation Strategy</h3>
                  <p className="text-gray-600">
                    Get automation recommendations with tool suggestions and coverage targets.
                  </p>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="max-w-6xl mx-auto">
            <div className="mb-6">
              <button
                onClick={handleReset}
                className="text-blue-600 hover:text-blue-700 font-medium flex items-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span>Back to Input</span>
              </button>
            </div>
            {results && (
              <ResultsDisplay results={results} onResultsChange={setResults} />
            )}
            {architectureResults && (
              <ArchitectureDisplay results={architectureResults} />
            )}
            {testingResults && (
              <TestingDisplay results={testingResults} />
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;