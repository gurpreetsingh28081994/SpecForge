import React, { useState } from 'react';
import { Copy, Download, Eye, Code, Layers, Database, Server, Globe } from 'lucide-react';
import { ArchitectureOutput } from '../types/architecture';

interface ArchitectureDisplayProps {
  results: ArchitectureOutput;
}

export const ArchitectureDisplay: React.FC<ArchitectureDisplayProps> = ({ results }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'hld' | 'lld' | 'techstack' | 'deployment'>('overview');
  const [diagramFormat, setDiagramFormat] = useState<'mermaid' | 'plantuml'>('mermaid');
  const [copiedToClipboard, setCopiedToClipboard] = useState(false);

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
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getComponentIcon = (type: string) => {
    switch (type) {
      case 'frontend': return <Globe className="w-4 h-4" />;
      case 'backend': return <Server className="w-4 h-4" />;
      case 'database': return <Database className="w-4 h-4" />;
      case 'service': return <Layers className="w-4 h-4" />;
      case 'external': return <Globe className="w-4 h-4" />;
      default: return <Server className="w-4 h-4" />;
    }
  };

  const getComponentColor = (type: string) => {
    switch (type) {
      case 'frontend': return 'bg-blue-100 text-blue-800';
      case 'backend': return 'bg-purple-100 text-purple-800';
      case 'database': return 'bg-green-100 text-green-800';
      case 'service': return 'bg-orange-100 text-orange-800';
      case 'external': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Project Summary */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 border">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Project Overview</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="text-sm text-gray-500">Project Type</div>
            <div className="text-lg font-semibold text-gray-800">{results.projectType}</div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="text-sm text-gray-500">Complexity Score</div>
            <div className="text-lg font-semibold text-gray-800">{results.metadata.complexity_score}/10</div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="text-sm text-gray-500">Team Size</div>
            <div className="text-lg font-semibold text-gray-800">{results.metadata.estimated_team_size}</div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="text-sm text-gray-500">Timeline</div>
            <div className="text-lg font-semibold text-gray-800">{results.metadata.estimated_timeline}</div>
          </div>
        </div>
      </div>

      {/* Scalability Requirements */}
      <div className="bg-white rounded-lg p-6 border">
        <h4 className="text-lg font-semibold text-gray-800 mb-3">Scalability Requirements</h4>
        <p className="text-gray-600">{results.scalabilityRequirements}</p>
      </div>

      {/* Components Overview */}
      <div className="bg-white rounded-lg p-6 border">
        <h4 className="text-lg font-semibold text-gray-800 mb-4">System Components</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {results.highLevelDiagram.components.map((component, index) => (
            <div key={index} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center space-x-3 mb-2">
                <div className={`p-2 rounded-lg ${getComponentColor(component.type)}`}>
                  {getComponentIcon(component.type)}
                </div>
                <div>
                  <h5 className="font-medium text-gray-800">{component.name}</h5>
                  <span className={`text-xs px-2 py-1 rounded-full ${getComponentColor(component.type)}`}>
                    {component.type}
                  </span>
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-3">{component.description}</p>
              <div className="flex flex-wrap gap-1">
                {component.technologies.map((tech, techIndex) => (
                  <span key={techIndex} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderDiagram = (diagram: any) => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-gray-800">{diagram.title}</h3>
          <p className="text-gray-600">{diagram.description}</p>
        </div>
        <div className="flex items-center space-x-2">
          <select
            value={diagramFormat}
            onChange={(e) => setDiagramFormat(e.target.value as 'mermaid' | 'plantuml')}
            className="border border-gray-300 rounded px-3 py-1 text-sm"
          >
            <option value="mermaid">Mermaid.js</option>
            <option value="plantuml">PlantUML</option>
          </select>
          <button
            onClick={() => copyToClipboard(diagramFormat === 'mermaid' ? diagram.mermaidCode : diagram.plantUmlCode)}
            className="inline-flex items-center space-x-2 bg-white text-gray-700 px-3 py-1 rounded border hover:bg-gray-50 transition-colors text-sm"
          >
            <Copy className="w-4 h-4" />
            <span>{copiedToClipboard ? 'Copied!' : 'Copy'}</span>
          </button>
          <button
            onClick={() => downloadContent(
              diagramFormat === 'mermaid' ? diagram.mermaidCode : diagram.plantUmlCode,
              `${diagram.type}-diagram.${diagramFormat === 'mermaid' ? 'mmd' : 'puml'}`
            )}
            className="inline-flex items-center space-x-2 bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition-colors text-sm"
          >
            <Download className="w-4 h-4" />
            <span>Download</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg border">
        <div className="border-b p-4">
          <h4 className="font-medium text-gray-800 flex items-center space-x-2">
            <Code className="w-4 h-4" />
            <span>{diagramFormat === 'mermaid' ? 'Mermaid.js' : 'PlantUML'} Code</span>
          </h4>
        </div>
        <div className="p-4">
          <pre className="bg-gray-50 rounded p-4 text-sm overflow-x-auto">
            <code>{diagramFormat === 'mermaid' ? diagram.mermaidCode : diagram.plantUmlCode}</code>
          </pre>
        </div>
      </div>

      <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
        <h5 className="font-medium text-blue-800 mb-2 flex items-center space-x-2">
          <Eye className="w-4 h-4" />
          <span>How to Visualize</span>
        </h5>
        <div className="text-sm text-blue-700 space-y-1">
          {diagramFormat === 'mermaid' ? (
            <>
              <p>• Copy the code and paste it into <a href="https://mermaid.live" target="_blank" rel="noopener noreferrer" className="underline">mermaid.live</a></p>
              <p>• Use Mermaid plugins in VS Code, Notion, or GitHub</p>
              <p>• Integrate with documentation tools like GitBook or Confluence</p>
            </>
          ) : (
            <>
              <p>• Copy the code and paste it into <a href="http://www.plantuml.com/plantuml" target="_blank" rel="noopener noreferrer" className="underline">PlantUML Online Server</a></p>
              <p>• Use PlantUML plugins in VS Code or IntelliJ IDEA</p>
              <p>• Generate images using PlantUML CLI or Docker</p>
            </>
          )}
        </div>
      </div>
    </div>
  );

  const renderTechStack = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-6 border">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Technology Stack Recommendations</h3>
        <p className="text-gray-600">
          Based on your requirements, complexity analysis, and industry best practices.
        </p>
      </div>

      <div className="grid gap-6">
        {results.techStack.map((recommendation, index) => (
          <div key={index} className="bg-white rounded-lg border p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h4 className="text-lg font-semibold text-gray-800">{recommendation.category}</h4>
                <div className="mt-2">
                  <span className="inline-flex items-center space-x-2 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                    <span>Recommended:</span>
                    <span className="font-bold">{recommendation.primary}</span>
                  </span>
                </div>
              </div>
            </div>
            
            <p className="text-gray-600 mb-4">{recommendation.reasoning}</p>
            
            <div>
              <h5 className="text-sm font-medium text-gray-700 mb-2">Alternatives:</h5>
              <div className="flex flex-wrap gap-2">
                {recommendation.alternatives.map((alt, altIndex) => (
                  <span key={altIndex} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-sm">
                    {alt}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderDeployment = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-6 border">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Deployment Strategy</h3>
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <h4 className="text-lg font-semibold text-gray-800 mb-2">{results.deploymentStrategy.type}</h4>
          <p className="text-gray-600 mb-4">{results.deploymentStrategy.description}</p>
          <div>
            <h5 className="text-sm font-medium text-gray-700 mb-2">Key Components:</h5>
            <div className="flex flex-wrap gap-2">
              {results.deploymentStrategy.components.map((component, index) => (
                <span key={index} className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm">
                  {component}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border p-6">
        <h4 className="text-lg font-semibold text-gray-800 mb-4">CI/CD Pipeline Recommendations</h4>
        <div className="space-y-4">
          <div className="border-l-4 border-blue-500 pl-4">
            <h5 className="font-medium text-gray-800">Source Control</h5>
            <p className="text-gray-600 text-sm">Git with GitHub/GitLab for version control and collaboration</p>
          </div>
          <div className="border-l-4 border-green-500 pl-4">
            <h5 className="font-medium text-gray-800">Build & Test</h5>
            <p className="text-gray-600 text-sm">GitHub Actions or GitLab CI for automated testing and builds</p>
          </div>
          <div className="border-l-4 border-purple-500 pl-4">
            <h5 className="font-medium text-gray-800">Deployment</h5>
            <p className="text-gray-600 text-sm">Automated deployment to staging and production environments</p>
          </div>
          <div className="border-l-4 border-orange-500 pl-4">
            <h5 className="font-medium text-gray-800">Monitoring</h5>
            <p className="text-gray-600 text-sm">Application monitoring with Sentry, logging with structured logs</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between p-6 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Architecture Analysis</h2>
          <p className="text-gray-600 mt-1">Comprehensive system design and technology recommendations</p>
        </div>
        <div className="text-sm text-gray-500">
          Generated: {new Date(results.metadata.generated_at).toLocaleDateString()}
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {[
            { id: 'overview', label: 'Overview', icon: <Layers className="w-4 h-4" /> },
            { id: 'hld', label: 'High-Level Design', icon: <Globe className="w-4 h-4" /> },
            { id: 'lld', label: 'Low-Level Design', icon: <Server className="w-4 h-4" /> },
            { id: 'techstack', label: 'Tech Stack', icon: <Code className="w-4 h-4" /> },
            { id: 'deployment', label: 'Deployment', icon: <Database className="w-4 h-4" /> }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
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
        {activeTab === 'hld' && renderDiagram(results.highLevelDiagram)}
        {activeTab === 'lld' && renderDiagram(results.lowLevelDiagram)}
        {activeTab === 'techstack' && renderTechStack()}
        {activeTab === 'deployment' && renderDeployment()}
      </div>
    </div>
  );
};