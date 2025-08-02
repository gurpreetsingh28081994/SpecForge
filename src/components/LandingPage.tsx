import React, { useState } from 'react';
import { FloatingChatbot } from './FloatingChatbot';
import { Sparkles, ArrowRight, Layers, Zap, Smartphone, Users, Shield, Link2, CheckCircle } from 'lucide-react';

interface LandingPageProps {
  onGetStarted: () => void;
  onRequirementsRefined: (requirements: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted, onRequirementsRefined }) => {

  const features = [
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      title: "AI-Powered Analysis",
      description: "Transform raw requirements into structured JIRA stories, architecture diagrams, and comprehensive test plans using advanced AI."
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      ),
      title: "Smart Architecture Design",
      description: "Generate high-level and low-level architecture diagrams with technology stack recommendations and deployment strategies."
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
      ),
      title: "Comprehensive Testing",
      description: "Create detailed test plans, test cases, and automation strategies for enterprise-grade quality assurance."
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      ),
      title: "AI Requirements Assistant",
      description: "Refine your requirements through intelligent conversation with our AI assistant before processing."
    }
  ];

  const integrations = [
    { name: "JIRA", logo: "🔧", description: "Direct integration with JIRA REST API" },
    { name: "Confluence", logo: "📚", description: "Import requirements from Confluence pages" },
    { name: "GitHub", logo: "🐙", description: "Version control and collaboration" },
    { name: "Slack", logo: "💬", description: "Team communication and notifications" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-pink-50 to-pink-100">
      {/* Basic Header */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center">
          <span
            className="text-2xl font-extrabold tracking-tight"
            style={{
              fontFamily: 'Montserrat, sans-serif',
              color: '#2563eb',
              letterSpacing: '-0.02em',
            }}
            // style={{
            //   fontFamily: 'Montserrat, sans-serif',
            //   background: 'linear-gradient(270deg, #2563eb, #7c3aed, #2563eb, #7c3aed)',
            //   backgroundSize: '400% 400%',
            //   WebkitBackgroundClip: 'text',
            //   WebkitTextFillColor: 'transparent',
            //   animation: 'gradientMove 6s ease-in-out infinite',
            //   display: 'inline-block',
            //   lineHeight: 1.15,
            //   paddingBottom: '0.15em',
            // }}
          >
            PRISM
          </span>
        </div>
      </header>
      <FloatingChatbot onRequirementsRefined={onRequirementsRefined} />
      {/* Hero Section */}
      <div className="relative overflow-hidden pb-16 pt-24 md:pt-32">
        {/* Animated background */}
        <div className="hero-animated-bg absolute inset-0 z-0 pointer-events-none" aria-hidden="true">
          <div className="absolute left-1/2 top-0 w-[80vw] h-[80vw] -translate-x-1/2 -translate-y-1/3 opacity-60 blur-3xl animate-blob-move bg-gradient-to-br from-blue-600/80 via-purple-400/60 to-white rounded-full" />
          <div className="absolute left-1/4 top-1/2 w-[40vw] h-[40vw] -translate-x-1/2 -translate-y-1/2 opacity-40 blur-2xl animate-blob-move2 bg-gradient-to-br from-purple-400/70 via-blue-600/60 to-white rounded-full" />
          <div className="absolute right-0 bottom-0 w-[60vw] h-[60vw] translate-x-1/3 translate-y-1/3 opacity-50 blur-2xl animate-blob-move3 bg-gradient-to-br from-blue-600/60 via-purple-400/50 to-white rounded-full" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center animate-fade-in-up">
            <h1
              className="text-4xl md:text-6xl font-extrabold text-gray-900 mb-6 tracking-tight leading-[1.15] text-center"
            >
              <span
                className="animated-gradient-text pb-1"
                style={{
                  fontFamily: 'Montserrat, sans-serif',
                  background: 'linear-gradient(270deg, #2563eb, #7c3aed, #2563eb, #7c3aed)',
                  backgroundSize: '400% 400%',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  animation: 'gradientMove 6s ease-in-out infinite',
                  display: 'inline-block',
                  lineHeight: 1.15,
                  paddingBottom: '0.15em',
                }}
              >
                PRISM
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-gray-700 mb-10 max-w-2xl mx-auto font-medium">
            <span className="text-brand font-semibold">Planning, Requirements, Intelligence, Story Mapping</span>
            </p>
            <p className="text-xl md:text-2xl text-gray-700 mb-10 max-w-2xl mx-auto font-medium">
              The ultimate AI-powered platform for transforming software requirements into JIRA stories, architecture designs, and comprehensive test plans.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={onGetStarted}
                className="inline-flex items-center justify-center px-8 py-4 bg-brand hover:bg-brand-dark text-white font-semibold rounded-xl shadow-lg hover:shadow-xl text-lg transition-all duration-200 group"
              >
                <Sparkles className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                Get Started
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 animate-fade-in-up">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4 flex items-center justify-center gap-2">
            <Layers className="w-7 h-7 text-brand" />
            Powerful Features for Modern Development
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            From requirement analysis to deployment strategies, PRISM provides everything you need to streamline your software development process.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-2xl transition-shadow duration-200 border border-gray-100 group flex flex-col items-center text-center relative overflow-hidden"
            >
              <div className="w-14 h-14 bg-gradient-to-br from-brand to-pink-400 rounded-xl flex items-center justify-center text-white mb-5 shadow-lg group-hover:scale-105 transition-transform">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-brand transition-colors">
                {feature.title}
              </h3>
              <p className="text-gray-600 text-base font-medium">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Integrations Section */}
      {false && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 animate-fade-in-up">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4 flex items-center justify-center gap-2">
              <Link2 className="w-7 h-7 text-brand" />
              Seamless Integrations
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Connect with your existing tools and workflows for a unified development experience.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {integrations.map((integration, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl shadow-lg p-8 text-center hover:shadow-2xl transition-shadow duration-200 border border-gray-100 flex flex-col items-center group relative overflow-hidden"
              >
                <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">{integration.logo}</div>
                <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-brand transition-colors">{integration.name}</h3>
                <p className="text-gray-600 text-base font-medium">{integration.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CTA Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 animate-fade-in-up">
        <div className="bg-gradient-to-r from-brand to-pink-400 rounded-2xl p-10 md:p-16 text-center text-white shadow-xl">
          <h2 className="text-3xl md:text-4xl font-extrabold mb-4 flex items-center justify-center gap-2">
            <Zap className="w-7 h-7" />
            Ready to Transform Your Development Process?
          </h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto font-medium">
            Join thousands of developers who are already using SpecForge to streamline their requirement analysis and project planning.
          </p>
          <button
            onClick={onGetStarted}
            className="inline-flex items-center justify-center px-8 py-4 bg-white text-brand font-semibold rounded-xl shadow-lg hover:bg-pink-50 hover:text-brand-dark transition-all duration-200 text-lg group"
          >
            <CheckCircle className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
            Start Your Free Trial
            <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
}; 