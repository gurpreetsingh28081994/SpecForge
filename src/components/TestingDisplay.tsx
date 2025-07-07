import React, { useState } from 'react';
import { Copy, Download, CheckCircle, AlertTriangle, Clock, Target, Zap, FileText, Settings, BarChart3 } from 'lucide-react';
import { TestingOutput } from '../types/testing';

interface TestingDisplayProps {
  results: TestingOutput;
}

export const TestingDisplay: React.FC<TestingDisplayProps> = ({ results }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'testplan' | 'testcases' | 'automation' | 'metrics'>('overview');
  const [expandedSuites, setExpandedSuites] = useState<Set<string>>(new Set());
  const [expandedTestCases, setExpandedTestCases] = useState<Set<string>>(new Set());
  const [copiedToClipboard, setCopiedToClipboard] = useState(false);

  const toggleSuite = (suiteName: string) => {
    const newExpanded = new Set(expandedSuites);
    if (newExpanded.has(suiteName)) {
      newExpanded.delete(suiteName);
    } else {
      newExpanded.add(suiteName);
    }
    setExpandedSuites(newExpanded);
  };

  const toggleTestCase = (testCaseId: string) => {
    const newExpanded = new Set(expandedTestCases);
    if (newExpanded.has(testCaseId)) {
      newExpanded.delete(testCaseId);
    } else {
      newExpanded.add(testCaseId);
    }
    setExpandedTestCases(newExpanded);
  };

  const copyToClipboard = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedToClipboard(true);
      setTimeout(() => setCopiedToClipboard(false), 2000);
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  };

  const downloadContent = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'bg-red-100 text-red-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'Low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Functional': return 'bg-blue-100 text-blue-800';
      case 'Integration': return 'bg-purple-100 text-purple-800';
      case 'Security': return 'bg-red-100 text-red-800';
      case 'Performance': return 'bg-orange-100 text-orange-800';
      case 'Edge Case': return 'bg-gray-100 text-gray-800';
      case 'Negative': return 'bg-pink-100 text-pink-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'High': return 'border-red-500 bg-red-50';
      case 'Medium': return 'border-yellow-500 bg-yellow-50';
      case 'Low': return 'border-green-500 bg-green-50';
      default: return 'border-gray-500 bg-gray-50';
    }
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Project Summary */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-6 border">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Test Project Overview</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="text-sm text-gray-500">Project</div>
            <div className="text-lg font-semibold text-gray-800">{results.test_plan.project_name}</div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="text-sm text-gray-500">Total Test Cases</div>
            <div className="text-lg font-semibold text-gray-800">{results.metrics.total_test_cases}</div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="text-sm text-gray-500">Automation Coverage</div>
            <div className="text-lg font-semibold text-gray-800">{results.automation_recommendations.coverage_target}%</div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="text-sm text-gray-500">Execution Time</div>
            <div className="text-lg font-semibold text-gray-800">{results.metrics.estimated_execution_time}</div>
          </div>
        </div>
      </div>

      {/* Test Suites Overview */}
      <div className="bg-white rounded-lg p-6 border">
        <h4 className="text-lg font-semibold text-gray-800 mb-4">Test Suites Summary</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {results.test_suites.map((suite, index) => (
            <div key={index} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-2">
                <h5 className="font-medium text-gray-800">{suite.name}</h5>
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                  {suite.test_cases.length} tests
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-3">{suite.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">Automation Coverage</span>
                <span className="text-xs font-medium text-green-600">{suite.automation_coverage}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                <div 
                  className="bg-green-500 h-2 rounded-full" 
                  style={{ width: `${suite.automation_coverage}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg p-6 border">
          <h4 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
            <Target className="w-5 h-5 mr-2 text-blue-600" />
            Test Coverage by Type
          </h4>
          <div className="space-y-2">
            {Object.entries(results.metrics.coverage_by_type).map(([type, count]) => (
              <div key={type} className="flex justify-between items-center">
                <span className={`px-2 py-1 rounded text-xs ${getTypeColor(type)}`}>
                  {type}
                </span>
                <span className="font-medium">{count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 border">
          <h4 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
            <Zap className="w-5 h-5 mr-2 text-green-600" />
            Automation Recommendations
          </h4>
          <div className="space-y-3">
            <div>
              <span className="text-sm text-gray-500">Framework:</span>
              <div className="font-medium">{results.automation_recommendations.framework}</div>
            </div>
            <div>
              <span className="text-sm text-gray-500">Target Coverage:</span>
              <div className="font-medium">{results.automation_recommendations.coverage_target}%</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 border">
          <h4 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
            <Clock className="w-5 h-5 mr-2 text-purple-600" />
            Timeline Estimates
          </h4>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Planning:</span>
              <span className="font-medium">{results.test_plan.timeline.test_planning}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Execution:</span>
              <span className="font-medium">{results.test_plan.timeline.test_execution}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Regression:</span>
              <span className="font-medium">{results.test_plan.timeline.regression_testing}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderTestPlan = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 border">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Test Plan Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold text-gray-700 mb-2">Project Scope</h4>
            <p className="text-gray-600">{results.test_plan.scope}</p>
          </div>
          <div>
            <h4 className="font-semibold text-gray-700 mb-2">QA Strategy</h4>
            <p className="text-gray-600">{results.test_plan.qa_strategy}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Test Types */}
        <div className="bg-white rounded-lg p-6 border">
          <h4 className="text-lg font-semibold text-gray-800 mb-4">Test Types</h4>
          <div className="space-y-2">
            {results.test_plan.test_types.map((type, index) => (
              <div key={index} className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-gray-700">{type}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Tools */}
        <div className="bg-white rounded-lg p-6 border">
          <h4 className="text-lg font-semibold text-gray-800 mb-4">Testing Tools</h4>
          <div className="space-y-3">
            <div>
              <h5 className="font-medium text-gray-700">Automation:</h5>
              <div className="flex flex-wrap gap-1 mt-1">
                {results.test_plan.tools.automation.map((tool, index) => (
                  <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                    {tool}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <h5 className="font-medium text-gray-700">Manual:</h5>
              <div className="flex flex-wrap gap-1 mt-1">
                {results.test_plan.tools.manual.map((tool, index) => (
                  <span key={index} className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                    {tool}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Entry & Exit Criteria */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg p-6 border">
          <h4 className="text-lg font-semibold text-gray-800 mb-4">Entry Criteria</h4>
          <div className="space-y-2">
            {results.test_plan.entry_criteria.map((criteria, index) => (
              <div key={index} className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                <span className="text-gray-700">{criteria}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 border">
          <h4 className="text-lg font-semibold text-gray-800 mb-4">Exit Criteria</h4>
          <div className="space-y-2">
            {results.test_plan.exit_criteria.map((criteria, index) => (
              <div key={index} className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                <span className="text-gray-700">{criteria}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Risk Analysis */}
      <div className="bg-white rounded-lg p-6 border">
        <h4 className="text-lg font-semibold text-gray-800 mb-4">Risk Analysis & Mitigation</h4>
        <div className="space-y-4">
          {results.test_plan.risks.map((risk, index) => (
            <div key={index} className={`border-l-4 p-4 rounded ${getRiskColor(risk.impact)}`}>
              <div className="flex items-start justify-between mb-2">
                <h5 className="font-medium text-gray-800">{risk.risk}</h5>
                <div className="flex space-x-2">
                  <span className={`px-2 py-1 rounded text-xs ${getPriorityColor(risk.probability)}`}>
                    {risk.probability} Probability
                  </span>
                  <span className={`px-2 py-1 rounded text-xs ${getPriorityColor(risk.impact)}`}>
                    {risk.impact} Impact
                  </span>
                </div>
              </div>
              <p className="text-sm text-gray-600">
                <strong>Mitigation:</strong> {risk.mitigation}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderTestCases = () => (
    <div className="space-y-6">
      {results.test_suites.map((suite, suiteIndex) => (
        <div key={suiteIndex} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div 
            className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 border-b cursor-pointer hover:from-blue-100 hover:to-purple-100 transition-colors"
            onClick={() => toggleSuite(suite.name)}
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">{suite.name}</h3>
                <p className="text-sm text-gray-600">{suite.description}</p>
              </div>
              <div className="flex items-center space-x-2">
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                  {suite.test_cases.length} test cases
                </span>
                <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                  {suite.automation_coverage}% automation
                </span>
              </div>
            </div>
          </div>

          {expandedSuites.has(suite.name) && (
            <div className="p-4">
              <div className="space-y-4">
                {suite.test_cases.map((testCase, tcIndex) => (
                  <div key={tcIndex} className="border rounded-lg">
                    <div 
                      className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                      onClick={() => toggleTestCase(testCase.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <span className="font-mono text-sm text-gray-500">{testCase.id}</span>
                            <h4 className="font-medium text-gray-800">{testCase.title}</h4>
                          </div>
                          <p className="text-sm text-gray-600">{testCase.description}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 rounded text-xs ${getPriorityColor(testCase.priority)}`}>
                            {testCase.priority}
                          </span>
                          <span className={`px-2 py-1 rounded text-xs ${getTypeColor(testCase.type)}`}>
                            {testCase.type}
                          </span>
                          {testCase.automation_candidate && (
                            <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs">
                              Auto
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {expandedTestCases.has(testCase.id) && (
                      <div className="px-4 pb-4 border-t bg-gray-50">
                        <div className="pt-4 space-y-4">
                          {/* Pre-conditions */}
                          <div>
                            <h5 className="font-medium text-gray-700 mb-2">Pre-conditions:</h5>
                            <ul className="list-disc list-inside space-y-1">
                              {testCase.pre_conditions.map((condition, index) => (
                                <li key={index} className="text-sm text-gray-600">{condition}</li>
                              ))}
                            </ul>
                          </div>

                          {/* Test Steps */}
                          <div>
                            <h5 className="font-medium text-gray-700 mb-2">Test Steps:</h5>
                            <div className="space-y-2">
                              {testCase.test_steps.map((step, index) => (
                                <div key={index} className="flex items-start space-x-3">
                                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium min-w-8 text-center">
                                    {step.step_number}
                                  </span>
                                  <span className="text-sm text-gray-700">{step.action}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Expected Result */}
                          <div>
                            <h5 className="font-medium text-gray-700 mb-2">Expected Result:</h5>
                            <p className="text-sm text-gray-600 bg-green-50 p-3 rounded border-l-4 border-green-500">
                              {testCase.expected_result}
                            </p>
                          </div>

                          {/* Additional Info */}
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <span className="text-gray-500">Execution Time:</span>
                              <div className="font-medium">{testCase.estimated_execution_time}</div>
                            </div>
                            <div>
                              <span className="text-gray-500">Automation Tool:</span>
                              <div className="font-medium">{testCase.automation_tool || 'Manual'}</div>
                            </div>
                            <div>
                              <span className="text-gray-500">Tags:</span>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {testCase.tags.map((tag, tagIndex) => (
                                  <span key={tagIndex} className="bg-gray-100 text-gray-700 px-1 py-0.5 rounded text-xs">
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );

  const renderAutomation = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-6 border">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Automation Strategy</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold text-gray-700 mb-2">Recommended Framework</h4>
            <p className="text-lg font-medium text-purple-600">{results.automation_recommendations.framework}</p>
            <p className="text-sm text-gray-600 mt-2">{results.automation_recommendations.reasoning}</p>
          </div>
          <div>
            <h4 className="font-semibold text-gray-700 mb-2">Target Coverage</h4>
            <div className="flex items-center space-x-3">
              <div className="text-3xl font-bold text-green-600">{results.automation_recommendations.coverage_target}%</div>
              <div className="text-sm text-gray-600">
                {results.metrics.automation_candidates} of {results.metrics.total_test_cases} test cases
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg p-6 border">
        <h4 className="text-lg font-semibold text-gray-800 mb-4">Priority Areas for Automation</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {results.automation_recommendations.priority_areas.map((area, index) => (
            <div key={index} className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
              <Zap className="w-5 h-5 text-blue-600" />
              <span className="font-medium text-gray-800">{area}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-lg p-6 border">
        <h4 className="text-lg font-semibold text-gray-800 mb-4">Automation Coverage by Suite</h4>
        <div className="space-y-4">
          {results.test_suites.map((suite, index) => (
            <div key={index} className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h5 className="font-medium text-gray-800">{suite.name}</h5>
                <span className="text-sm font-medium text-gray-600">{suite.automation_coverage}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-300" 
                  style={{ width: `${suite.automation_coverage}%` }}
                ></div>
              </div>
              <div className="mt-2 text-sm text-gray-600">
                {suite.test_cases.filter(tc => tc.automation_candidate).length} of {suite.test_cases.length} test cases can be automated
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderMetrics = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-indigo-50 to-cyan-50 rounded-lg p-6 border">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Testing Metrics & Analytics</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg p-4 shadow-sm text-center">
            <div className="text-2xl font-bold text-blue-600">{results.metrics.total_test_cases}</div>
            <div className="text-sm text-gray-500">Total Test Cases</div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm text-center">
            <div className="text-2xl font-bold text-green-600">{results.metrics.automation_candidates}</div>
            <div className="text-sm text-gray-500">Automation Candidates</div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm text-center">
            <div className="text-2xl font-bold text-purple-600">{results.automation_recommendations.coverage_target}%</div>
            <div className="text-sm text-gray-500">Target Coverage</div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm text-center">
            <div className="text-2xl font-bold text-orange-600">{results.metrics.estimated_execution_time}</div>
            <div className="text-sm text-gray-500">Execution Time</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg p-6 border">
          <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <BarChart3 className="w-5 h-5 mr-2" />
            Test Distribution by Type
          </h4>
          <div className="space-y-3">
            {Object.entries(results.metrics.coverage_by_type).map(([type, count]) => {
              const percentage = Math.round((count / results.metrics.total_test_cases) * 100);
              return (
                <div key={type}>
                  <div className="flex justify-between items-center mb-1">
                    <span className={`px-2 py-1 rounded text-xs ${getTypeColor(type)}`}>
                      {type}
                    </span>
                    <span className="text-sm font-medium">{count} ({percentage}%)</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full" 
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 border">
          <h4 className="text-lg font-semibold text-gray-800 mb-4">Test Suite Breakdown</h4>
          <div className="space-y-3">
            {results.test_suites.map((suite, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <div>
                  <div className="font-medium text-gray-800">{suite.name}</div>
                  <div className="text-sm text-gray-600">{suite.test_cases.length} test cases</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-green-600">{suite.automation_coverage}%</div>
                  <div className="text-xs text-gray-500">automation</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg p-6 border">
        <h4 className="text-lg font-semibold text-gray-800 mb-4">Generation Summary</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-gray-500">Generated At:</span>
            <div className="font-medium">{new Date(results.metadata.generated_at).toLocaleDateString()}</div>
          </div>
          <div>
            <span className="text-gray-500">Requirements Analyzed:</span>
            <div className="font-medium">{results.metadata.requirements_analyzed}</div>
          </div>
          <div>
            <span className="text-gray-500">Complexity Score:</span>
            <div className="font-medium">{results.metadata.complexity_score}/10</div>
          </div>
          <div>
            <span className="text-gray-500">Test Suites:</span>
            <div className="font-medium">{results.test_suites.length}</div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between p-6 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">QA Test Plan & Test Cases</h2>
          <p className="text-gray-600 mt-1">Comprehensive testing strategy and detailed test cases</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => copyToClipboard(JSON.stringify(results, null, 2))}
            className="inline-flex items-center space-x-2 bg-white text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 border transition-colors"
          >
            <Copy className="w-4 h-4" />
            <span>{copiedToClipboard ? 'Copied!' : 'Copy JSON'}</span>
          </button>
          <button
            onClick={() => downloadContent(JSON.stringify(results, null, 2), `test-plan-${new Date().toISOString().split('T')[0]}.json`)}
            className="inline-flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Download</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {[
            { id: 'overview', label: 'Overview', icon: <Target className="w-4 h-4" /> },
            { id: 'testplan', label: 'Test Plan', icon: <FileText className="w-4 h-4" /> },
            { id: 'testcases', label: 'Test Cases', icon: <CheckCircle className="w-4 h-4" /> },
            { id: 'automation', label: 'Automation', icon: <Zap className="w-4 h-4" /> },
            { id: 'metrics', label: 'Metrics', icon: <BarChart3 className="w-4 h-4" /> }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                activeTab === tab.id
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="min-h-96">
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'testplan' && renderTestPlan()}
        {activeTab === 'testcases' && renderTestCases()}
        {activeTab === 'automation' && renderAutomation()}
        {activeTab === 'metrics' && renderMetrics()}
      </div>
    </div>
  );
};