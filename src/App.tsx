import React, { useState } from 'react';
import { Header } from './components/Header';
import { LandingPage } from './components/LandingPage';
import { FileUpload } from './components/FileUpload';
import { TextInput } from './components/TextInput';
import { ResultsDisplay } from './components/ResultsDisplay';
import { ArchitectureDisplay } from './components/ArchitectureDisplay';
import { TestingDisplay } from './components/TestingDisplay';
import { RequirementsParser } from './utils/requirementsParser';
import { ArchitectureAnalyzer } from './utils/architectureAnalyzer';
import { TestingAnalyzer } from './utils/testingAnalyzer';
import { analyzeWithAIAgent, AnalysisMode, transformJiraResponseHybrid, transformArchitectureResponseHybrid, transformTestingResponseHybrid } from './utils/aiAgent';
import { JiraOutput } from './types/jira';
import { ArchitectureOutput } from './types/architecture';
import { TestingOutput } from './types/testing';

function App() {
  const [showLandingPage, setShowLandingPage] = useState(true);
  const [results, setResults] = useState<JiraOutput | null>(null);
  const [architectureResults, setArchitectureResults] = useState<ArchitectureOutput | null>(null);
  const [testingResults, setTestingResults] = useState<TestingOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'text' | 'upload'>('text');
  const [analysisMode, setAnalysisMode] = useState<'jira' | 'architecture' | 'testing'>('jira');

  const MOCK_ARCHITECTURE_RESPONSE = {
    response: `## Project Overview\n- Project Type: AI Art Platform\n- Complexity Score (out of 10): 7\n- Estimated Team Size: 6-8\n- Estimated Timeline: 4-6 months\n\n## Scalability Requirements\n- Support for thousands of concurrent users\n- Scalable AI inference for art generation\n- Elastic storage for user-generated content\n- Auto-scaling backend services\n\n## System Components\n| Name | Type | Description | Technologies | Icon |\n|------|------|-------------|--------------|------|\n| Frontend Application | frontend | User interface and client-side logic | React, TypeScript, Tailwind CSS | globe |\n| Backend API | backend | Core business logic and API endpoints | Node.js, Express, TypeScript | server |\n| Primary Database | database | Main data storage | PostgreSQL | database |\n| Payment Gateway | external | Payment processing | Stripe, Razorpay | globe |\n| Notification Service | service | Email and push notifications | SendGrid, Firebase Cloud Messaging | layers |\n| Analytics Service | service | User analytics and tracking | PostHog, Google Analytics | layers |\n\n## High-Level Architecture Diagram\n\n### Mermaid.js\n\n\`\`\`mermaid\ngraph TD;\n    A[User] -->|Sign Up| B[Auth Service]\n    A -->|Sign In| B\n    A -->|Generate Art| C[AI Art Generator]\n    A -->|Share Art| D[Content Sharing]\n    A -->|Download Art| E[Download Service]\n    A -->|Access Premium Features| F[Payment Service]\n    G[Admin] -->|Moderate Content| D\n    D -->|Analytics| H[Analytics Service]\n\`\`\`\n\n### PlantUML\n\n\`\`\`plantuml\n@startuml\nactor User\nactor Admin\nUser -> AuthService: Sign Up/Sign In\nUser -> AIGenerator: Generate Art\nUser -> ContentSharing: Share Art\nUser -> DownloadService: Download Art\nUser -> PaymentService: Access Premium Features\nAdmin -> ContentSharing: Moderate Content\nContentSharing -> AnalyticsService: Provide Analytics\n@enduml\n\`\`\`\n\n## Low-Level Architecture Diagram\n\n### Mermaid.js\n\n\`\`\`mermaid\ngraph TD;\n    A[Frontend] -->|Responsive Design| B[UI Framework]\n    A -->|Dark Mode| B\n    A -->|Auth| C[Google/Firebase]\n    A -->|Payment| D[Payment Gateway]\n    E[Backend] -->|Art Generation| F[AI Model]\n    E -->|Moderation| G[Moderation Tools]\n    E -->|Database| H[Database]\n    E -->|Analytics| I[Analytics Tools]\n\`\`\`\n\n### PlantUML\n\n\`\`\`plantuml\n@startuml\npackage \"Frontend\" {\n  component UIFramework\n  component AuthService\n  component PaymentGateway\n}\n\npackage \"Backend\" {\n  component AIGenerator\n  component ModerationTools\n  component Database\n  component AnalyticsTools\n}\n\nUIFramework <- AuthService: Responsive Design, Dark Mode\nAuthService <- PaymentGateway: Payment Integration\nAIGenerator <- ModerationTools: Content Moderation\nAIGenerator <- Database: Store Art Data\nAIGenerator <- AnalyticsTools: User Engagement Analytics\n@enduml\n\`\`\`\n\n## Tech Stack Recommendations\n- Frontend: React, Tailwind CSS\n- Backend: Node.js, Express\n- Database: PostgreSQL\n- Other: Firebase Authentication, Stripe for payments, AWS S3 for storage\n\n## Deployment Strategy\n- Use Docker to containerize the application.\n- Deploy on AWS using services like EC2 for compute and RDS for database.\n- Implement CI/CD pipelines using GitHub Actions for automated deployments.\n- Utilize CloudFront for CDN to enhance speed and reliability.`
  };

  const MOCK_JIRA_RESPONSE = {
    response: `**Epic 1: User Authentication**\n- **User Story 1.1: Sign Up with Google**\n  - **Description**: Allow users to sign up using their Google account.\n  - **Acceptance Criteria**:\n    - Users can sign up using their Google credentials.\n    - Successful sign-up redirects users to the home page.\n    - Error messages are displayed for failed sign-up attempts.\n\n- **User Story 1.2: Sign Up with Email**\n  - **Description**: Allow users to sign up using their email address.\n  - **Acceptance Criteria**:\n    - Users can sign up using a valid email address and password.\n    - Successful sign-up redirects users to the home page.\n    - Error messages are displayed for invalid email or password.\n\n**Epic 2: AI-Generated Art**\n- **User Story 2.1: Create AI-Generated Art**\n  - **Description**: Allow users to generate art using AI.\n  - **Acceptance Criteria**:\n    - Users can input parameters to generate art.\n    - The system generates art based on user inputs.\n    - Users receive a notification once art generation is complete.\n\n- **User Story 2.2: Share AI-Generated Art**\n  - **Description**: Allow users to share their AI-generated art.\n  - **Acceptance Criteria**:\n    - Users can share art via social media or direct link.\n    - Shared art can be viewed by others without login.\n    - Options to edit or delete shared art are available.\n\n**Epic 3: Content Moderation**\n- **User Story 3.1: Moderate Shared Content**\n  - **Description**: Allow admins to review and moderate shared content.\n  - **Acceptance Criteria**:\n    - Admins can view all shared content.\n    - Admins can approve or reject content.\n    - Notifications are sent to users for rejected content with reasons.\n\n**Epic 4: Mobile Responsiveness and Dark Mode**\n- **User Story 4.1: Mobile Responsive Design**\n  - **Description**: Ensure the app is responsive on mobile devices.\n  - **Acceptance Criteria**:\n    - The app layout adjusts to various mobile screen sizes.\n    - All functionalities are accessible on mobile devices.\n\n- **User Story 4.2: Dark Mode Support**\n  - **Description**: Provide a dark mode option for users.\n  - **Acceptance Criteria**:\n    - Users can toggle between light and dark mode.\n    - The app maintains usability and accessibility in dark mode.\n\n**Epic 5: Download Art**\n- **User Story 5.1: Download Art in PNG Format**\n  - **Description**: Allow users to download their art in PNG format.\n  - **Acceptance Criteria**:\n    - Users can select PNG format for download.\n    - Downloaded PNG files maintain image quality.\n\n- **User Story 5.2: Download Art in JPG Format**\n  - **Description**: Allow users to download their art in JPG format.\n  - **Acceptance Criteria**:\n    - Users can select JPG format for download.\n    - Downloaded JPG files maintain image quality.\n\n**Epic 6: User Engagement Analytics**\n- **User Story 6.1: Provide User Engagement Analytics**\n  - **Description**: Offer analytics on user engagement within the app.\n  - **Acceptance Criteria**:\n    - Admins can view metrics such as active users and art shares.\n    - Analytics are updated in real-time and displayed in a dashboard.\n\n**Epic 7: Payment Integration**\n- **User Story 7.1: Integrate Payment for Premium Features**\n  - **Description**: Enable payment processing for accessing premium features.\n  - **Acceptance Criteria**:\n    - Users can securely input payment information.\n    - Successful payment grants access to premium features.\n    - Error messages are displayed for failed transactions.`
  };

  const MOCK_TESTING_RESPONSE = {
    response: `## Test Plan\n- Validate user sign-up functionality via Google and Email.\n- Verify user login and session management.\n- Ensure the creation and sharing of AI-generated art.\n- Test admin moderation capabilities for shared content.\n- Check mobile responsiveness across various devices.\n- Confirm dark mode functionality.\n- Validate art download in PNG and JPG formats.\n- Assess analytics for user engagement.\n- Test payment integration for premium features.\n- Perform regression testing.\n\n## Test Suites and Test Cases\n\n### Suite: User Sign-up and Authentication\n- **Test Case 1:** Sign-up via Google\n  - **Description:** Test user registration using Google account.\n  - **Steps:** \n    1. Click on 'Sign up with Google.'\n    2. Authenticate using Google credentials.\n    3. Confirm account creation.\n  - **Expected Result:** User is successfully registered and logged in.\n  - **Priority:** High\n\n- **Test Case 2:** Sign-up via Email\n  - **Description:** Test user registration using email.\n  - **Steps:** \n    1. Click on 'Sign up via Email.'\n    2. Enter valid email and password.\n    3. Confirm email verification.\n  - **Expected Result:** User is successfully registered and logged in.\n  - **Priority:** High\n\n### Suite: AI Art Creation and Sharing\n- **Test Case 1:** Create AI Art\n  - **Description:** Test creation of AI-generated art.\n  - **Steps:** \n    1. Log in to the application.\n    2. Navigate to 'Create Art.'\n    3. Generate art using AI tools.\n  - **Expected Result:** Art is generated and displayed successfully.\n  - **Priority:** Medium\n\n- **Test Case 2:** Share AI Art\n  - **Description:** Test sharing of AI-generated art.\n  - **Steps:** \n    1. Navigate to created art.\n    2. Click on 'Share' button.\n    3. Choose sharing options (e.g., social media).\n  - **Expected Result:** Art is shared successfully.\n  - **Priority:** Medium\n\n### Suite: Content Moderation\n- **Test Case 1:** Admin Moderation of Shared Art\n  - **Description:** Test admin ability to moderate shared content.\n  - **Steps:** \n    1. Log in as Admin.\n    2. View shared content.\n    3. Approve or reject content based on guidelines.\n  - **Expected Result:** Admin can moderate content effectively.\n  - **Priority:** High\n\n### Suite: Mobile Responsiveness and Dark Mode\n- **Test Case 1:** Mobile Responsiveness\n  - **Description:** Test application responsiveness on mobile devices.\n  - **Steps:** \n    1. Access the application on various mobile devices.\n    2. Verify layout and functionality.\n  - **Expected Result:** Application is responsive and functional on mobile.\n  - **Priority:** High\n\n- **Test Case 2:** Dark Mode Functionality\n  - **Description:** Test the application's dark mode feature.\n  - **Steps:** \n    1. Toggle dark mode option in settings.\n    2. Verify UI changes to dark mode.\n  - **Expected Result:** Application displays correctly in dark mode.\n  - **Priority:** Medium\n\n### Suite: Art Download\n- **Test Case 1:** Download Art in PNG Format\n  - **Description:** Test downloading of art in PNG format.\n  - **Steps:** \n    1. Navigate to created art.\n    2. Select 'Download as PNG.'\n  - **Expected Result:** Art is downloaded successfully in PNG format.\n  - **Priority:** Medium\n\n- **Test Case 2:** Download Art in JPG Format\n  - **Description:** Test downloading of art in JPG format.\n  - **Steps:** \n    1. Navigate to created art.\n    2. Select 'Download as JPG.'\n  - **Expected Result:** Art is downloaded successfully in JPG format.\n  - **Priority:** Medium\n\n### Suite: Analytics and Payment Integration\n- **Test Case 1:** User Engagement Analytics\n  - **Description:** Test analytics for user engagement.\n  - **Steps:** \n    1. Access analytics dashboard.\n    2. Verify statistics and data.\n  - **Expected Result:** Accurate analytics are displayed.\n  - **Priority:** High\n\n- **Test Case 2:** Payment Integration for Premium Features\n  - **Description:** Test payment processing for premium features.\n  - **Steps:** \n    1. Access premium features.\n    2. Complete payment process.\n  - **Expected Result:** Payment is processed and features are unlocked.\n  - **Priority:** High\n\n## Automation Recommendations\n- Automate regression tests for user sign-up and authentication.\n- Implement automated testing for AI art creation and sharing.\n- Develop automated scripts for mobile responsiveness testing.\n- Automate tests for dark mode functionality.\n- Utilize automation for art download verification.\n- Automate analytics data validation.\n\n##
`};

  const handleAnalyze = async (text: string) => {
    setIsLoading(true);
    try {
      // Use AI agent for all modes
      // if (analysisMode === 'architecture' && import.meta.env.DEV) {
      //   const parsed = transformArchitectureResponseHybrid(MOCK_ARCHITECTURE_RESPONSE);
      //   setArchitectureResults(parsed);
      //   setResults(null);
      //   setTestingResults(null);
      //   setIsLoading(false);
      //   return;
      // }
      // if (analysisMode === 'jira' && import.meta.env.DEV) {
      //   const parsed = transformJiraResponseHybrid(MOCK_JIRA_RESPONSE.response);
      //   setResults(parsed);
      //   setArchitectureResults(null);
      //   setTestingResults(null);
      //   setIsLoading(false);
      //   return;
      // }
      // if (analysisMode === 'testing' && import.meta.env.DEV) {
      //   const parsed = transformTestingResponseHybrid(MOCK_TESTING_RESPONSE);
      //   setTestingResults(parsed);
      //   setResults(null);
      //   setArchitectureResults(null);
      //   setIsLoading(false);
      //   return;
      // }
      const aiResponse = await analyzeWithAIAgent(text, analysisMode as AnalysisMode);
      if (analysisMode === 'jira') {
        // Use hybrid parser for JIRA
        const parsed = transformJiraResponseHybrid(aiResponse);
        setResults(parsed);
        setArchitectureResults(null);
        setTestingResults(null);
      } else if (analysisMode === 'architecture') {
        const parsed = transformArchitectureResponseHybrid(aiResponse);
        setArchitectureResults(parsed);
        setResults(null);
        setTestingResults(null);
      } else if (analysisMode === 'testing') {
        const parsed = transformTestingResponseHybrid(aiResponse);
        setTestingResults(parsed);
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

  const handleGetStarted = () => {
    setShowLandingPage(false);
  };

  const handleRequirementsRefined = (requirements: string) => {
    setShowLandingPage(false);
    // Pre-fill the text input with refined requirements
    // This will be handled by the TextInput component
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {showLandingPage ? (
        <LandingPage 
          onGetStarted={handleGetStarted}
          onRequirementsRefined={handleRequirementsRefined}
        />
      ) : (
        <>
          <Header onBackToLanding={() => setShowLandingPage(true)} />
          
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
        </>
      )}
    </div>
  );
}

export default App;