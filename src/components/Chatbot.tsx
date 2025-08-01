import React, { useState, useRef, useEffect } from 'react';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

interface ChatbotProps {
  onRequirementsRefined: (requirements: string) => void;
}

export const Chatbot: React.FC<ChatbotProps> = ({ onRequirementsRefined }) => {
  const [conversationStep, setConversationStep] = useState<'understanding' | 'scope' | 'mapping' | 'refinement' | 'final'>('understanding');
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: `👋 **Welcome! I'm your AI Requirements Assistant.**

I'm here to transform your raw idea into a refined, ready-to-implement user requirement aligned with business goals and system architecture.

**Let's start with understanding your requirement:**

🧭 **Step 1: Understanding the Requirement**

To better understand your requirement, could you please provide:

1. **Business Goal**: What specific problem are you trying to solve or what goal are you aiming to achieve?

2. **User Persona**: Who are the primary users of this feature? Are they end customers, delivery personnel, or internal staff?

3. **Usage Context**: How do users currently manage this need? Are there any pain points or areas for improvement?

Please share your thoughts on these questions.`,
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (messagesEndRef.current && shouldAutoScroll) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const element = e.currentTarget;
    const isNearBottom = element.scrollHeight - element.scrollTop - element.clientHeight < 50;
    setShouldAutoScroll(isNearBottom);
  };

  useEffect(() => {
    // Only scroll when new messages are added, not on initial load
    if (messages.length > 1 && shouldAutoScroll) {
      const timer = setTimeout(() => {
        scrollToBottom();
      }, 100); // Small delay to ensure DOM is updated
      
      return () => clearTimeout(timer);
    }
  }, [messages, shouldAutoScroll]);

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      const aiAgentUrl = import.meta.env.VITE_AI_AGENT_URL as string;
      if (!aiAgentUrl) {
        throw new Error('VITE_AI_AGENT_URL environment variable is not set');
      }
      
      // Ensure we don't double-append /ask
      const endpointUrl = aiAgentUrl.endsWith('/ask') ? aiAgentUrl : `${aiAgentUrl}/ask`;
      const response = await fetch(endpointUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_query: text,
          agent_role: `You are an expert Requirements Analyst and Product Owner responsible for transforming a raw idea into a refined, ready-to-implement user requirement, aligned with business goals and system architecture.

Your tasks:

🧭 1. Understand the Requirement
Ask clarifying questions to understand the problem, goal, and user need.
Determine the user persona and usage context.

🧩 2. Define Scope & Structure the Requirement
Break it into epics, features, or user stories using INVEST principles.
Clearly call out what is in scope, out of scope, and any dependencies.

🔄 3. Map to System & Process
Ask the user:
Which business process or workflow does this requirement affect?
Which MAPI, service, or backend API will this requirement likely touch or need changes in?
Are there existing UI components, database entities, or third-party systems involved?

🔍 4. Refine via Q&A
Dive deep into edge cases, failure scenarios, and data validation.
Confirm performance, scalability, or security concerns.

✅ 5. Final Output
Provide the following deliverables:

📄 User Story / Feature Description
As a [user persona], I want to [do something] so that [value or benefit].

✅ Acceptance Criteria (Gherkin style preferred)
Given [context]
When [action]
Then [expected outcome]

🔧 MAPI / Service / Process Mapping
Related API(s): e.g., POST /quick-save
Business Process Impacted: e.g., Quote Submission
Dependencies: e.g., Notification service, Audit logs

⚠️ Open Questions / Assumptions / Risks
List unknowns, risks, or validation needs

**IMPORTANT**: Ask questions one by one in a conversational manner. After each user response, ask the next logical question based on the conversation flow. Be specific and detailed in your questions to gather comprehensive information.

**Current conversation step**: ${conversationStep}`
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();
      
      // Handle the response from the external AI agent
      let formattedResponse = data.response || data.message || data.content || 'No response received';
      
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: formattedResponse,
        sender: 'bot',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);

      // If the bot suggests the requirements are ready, trigger the callback
      if (data.suggestions && data.suggestions.length > 0) {
        const refinedRequirements = data.suggestions.join('\n\n');
        onRequirementsRefined(refinedRequirements);
      } else if (data.response && data.response.includes('ready') || data.response.includes('final')) {
        // If the response indicates readiness, trigger the callback
        onRequirementsRefined(data.response);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "I'm sorry, I'm having trouble connecting to the Expert Business Analyst service. Please check if the service is running and try again.",
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(inputText);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(inputText);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-lg">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-t-lg">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold">AI Requirements Assistant</h3>
            <p className="text-sm text-blue-100">Transform your ideas into structured requirements</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div 
        className="flex-1 overflow-y-auto p-4 space-y-4 max-h-96 scroll-smooth relative"
        onScroll={handleScroll}
      >
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                message.sender === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              <p className="text-sm">{message.text}</p>
              <p className="text-xs opacity-70 mt-1">
                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 text-gray-800 px-4 py-2 rounded-lg">
              <div className="flex items-center space-x-2">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
                <span className="text-sm">AI is thinking...</span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
        
        {/* Scroll to bottom button */}
        {!shouldAutoScroll && (
          <button
            onClick={() => {
              setShouldAutoScroll(true);
              scrollToBottom();
            }}
            className="absolute bottom-20 right-4 bg-blue-600 text-white p-2 rounded-full shadow-lg hover:bg-blue-700 transition-colors"
            title="Scroll to bottom"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </button>
        )}
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-200">
        <form onSubmit={handleSubmit} className="flex space-x-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !inputText.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
}; 