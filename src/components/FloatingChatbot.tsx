import React, { useEffect, useRef, useState } from 'react';
import { Clipboard, Check } from 'lucide-react';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  options?: string[];
}

interface FloatingChatbotProps {
  onRequirementsRefined: (requirements: string) => void;
  onPasteToJira?: (text: string) => void;
}

const BUSINESS_PROCESSES = [
  'ADDON_MANAGEMENT',
  'TARIFF_CHANGE',
  'CONTRACT_PROLONGATION',
  'ACQUISITION',
  'PREPAID_TO_POSTPAID_MIGRATION',
  'E_SIM_ACTIVATION',
];
const CHANNELS = [
  'ONE_APP',
  'ONE_SHOP',
  'ONE_TV',
  'ONE_APP_WEB',
  'YOUNG_APP',
  'MAVI',
  'MOM',
  'AVIA',
  'B2B_PORTAL',
  'PHOENIX',
  'TVPP',
  'THOP',
  'THOP_PSGATE',
  'B2B_STD_ASSISTED',
];
const DEVICE_TYPES = ['FIXED', 'MOBILE', 'OTT'];

function saveToSession(key: string, value: string) {
  sessionStorage.setItem(key, value);
}
function getFromSession(key: string) {
  return sessionStorage.getItem(key);
}

export const FloatingChatbot: React.FC<FloatingChatbotProps> = ({ onRequirementsRefined, onPasteToJira }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(0); // 0: business process, 1: channel, 2: device type, 3: normal chat
  const [businessProcess, setBusinessProcess] = useState<string | null>(getFromSession('businessProcess'));
  const [channel, setChannel] = useState<string | null>(getFromSession('channel'));
  const [deviceType, setDeviceType] = useState<string | null>(getFromSession('deviceType'));
  const [messages, setMessages] = useState<Message[]>([{
    id: '1',
    text: `👋 **Welcome! I'm your AI Requirements Assistant.**\n\nLet's get started. Please select the business process relevant to your requirement:`,
    sender: 'bot',
    timestamp: new Date(),
    options: BUSINESS_PROCESSES,
  }]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);
  const [hasPastedToJira, setHasPastedToJira] = useState(false);
  const [copiedMsgId, setCopiedMsgId] = useState<string | null>(null);
  const [showNextStepBubble, setShowNextStepBubble] = useState(false);
  const [lastAiResponse, setLastAiResponse] = useState<string | null>(null);

    const USE_MOCK_BRD = true; // Set to false to use real backend


  // Scroll logic
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
    if (messages.length > 1 && shouldAutoScroll) {
      const timer = setTimeout(() => {
        scrollToBottom();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [messages, shouldAutoScroll]);

  // Handle option selection for the first 3 steps
  const handleOptionSelect = (option: string) => {
    // Add user message
    setMessages(prev => [
      ...prev,
      {
        id: Date.now().toString(),
        text: option,
        sender: 'user',
        timestamp: new Date(),
      },
    ]);
    if (step === 0) {
      setBusinessProcess(option);
      saveToSession('businessProcess', option);
      // Add next bot message
      setTimeout(() => {
        setMessages(prev => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            text: 'Please select the channel for this requirement:',
            sender: 'bot',
            timestamp: new Date(),
            options: CHANNELS,
          },
        ]);
        setStep(1);
      }, 300);
    } else if (step === 1) {
      setChannel(option);
      saveToSession('channel', option);
      setTimeout(() => {
        setMessages(prev => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            text: 'Please select the device type for this requirement:',
            sender: 'bot',
            timestamp: new Date(),
            options: DEVICE_TYPES,
          },
        ]);
        setStep(2);
      }, 300);
    } else if (step === 2) {
      setDeviceType(option);
      saveToSession('deviceType', option);
      setTimeout(() => {
        setMessages(prev => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            text: 'Thank you! You can now describe your requirement or ask a question.',
            sender: 'bot',
            timestamp: new Date(),
          },
        ]);
        setStep(3);
      }, 300);
    }
  };

  const MOCK_BRD_RESPONSE = `
# Business Requirement Document (BRD)

## 1. Executive Summary

The purpose of this document is to outline the requirements for developing a mobile-responsive feature within the "B2B_PORTAL" that facilitates user interaction with the "ADDON_MANAGEMENT" business process. This feature aims to enhance user experience by providing a seamless, secure, and scalable mobile interface that integrates effectively with existing backend systems.

## 2. Service Breakdown

### Service: Mobile-Responsive Feature for "ADDON_MANAGEMENT"

- **Description**: 
  Develop a mobile-friendly interface for the "ADDON_MANAGEMENT" process within the "B2B_PORTAL", optimized for various mobile devices and screen sizes.

- **Current Behaviour**: 
  Currently, users access the "ADDON_MANAGEMENT" process via desktop interfaces, which are not optimized for mobile devices.

- **APIs Involved**: 
  - MAPI GURU

- **Responsible Team**: 
  - Authentication Team

- **Importance Score**: 
  - 0.95
  - **Interpretation**: This score indicates a high priority for addressing authentication issues, as unauthorized access errors are critical to resolve for ensuring secure user interactions.

### Service: MAPI GURU API Error

- **Description**: 
  The API is experiencing unauthorized access errors due to invalid authentication credentials.

- **Current Behaviour**: 
  The API request is being rejected, preventing users from accessing the necessary functionalities.

- **APIs Involved**: 
  - MAPI GURU

- **Responsible Team**: 
  - Authentication Team

- **Importance Score**: 
  - 0.95
  - **Interpretation**: The high score reflects the urgency to rectify authentication issues to prevent service disruptions and enhance security.

## 3. Interdependencies

- The mobile-responsive feature for "ADDON_MANAGEMENT" relies heavily on secure and efficient data exchange with backend systems via the MAPI GURU API.
- Authentication mechanisms are crucial to ensure secure access, requiring close collaboration between the development and authentication teams.

## 4. Business Impact

- **User Experience**: 
  By providing a mobile-responsive interface, users can manage add-ons conveniently, leading to increased satisfaction and engagement.

- **Business Goals**: 
  Enhancing mobile accessibility aligns with strategic objectives to expand user reach and improve service delivery across diverse platforms.

## 5. Recommendations or Next Steps

- **Authentication Improvement**: 
  Address the unauthorized access error by reviewing and strengthening authentication protocols, ensuring valid credentials are used.

- **API Security Enhancement**: 
  Implement additional security measures, such as encryption protocols, to protect data in transit and at rest.

- **Scalability Planning**: 
  Design the system architecture to accommodate future growth, ensuring it can handle increased user loads and additional features without performance degradation.

- **Logging and Monitoring**: 
  Develop comprehensive logging and monitoring capabilities to track user interactions and system performance, facilitating troubleshooting and reliability assurance.

By focusing on these areas, the development team can create a robust and secure mobile solution for the "ADDON_MANAGEMENT" process within the "B2B_PORTAL," enhancing user experience and achieving business objectives.
`;

  // Normal chat send
  const sendMessage = async (text: string) => {
    if (!text.trim()) return;
    setMessages(prev => [
      ...prev,
      {
        id: Date.now().toString(),
        text,
        sender: 'user',
        timestamp: new Date(),
      },
    ]);
    setInputText('');
    setIsLoading(true);
    // MOCK: If flag is true and this is the first free-text after step 3, show mock response
    if (USE_MOCK_BRD && step === 3) {
      setTimeout(() => {
        setMessages(prev => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            text: MOCK_BRD_RESPONSE,
            sender: 'bot',
            timestamp: new Date(),
          },
        ]);
        setLastAiResponse(MOCK_BRD_RESPONSE);
        setShowNextStepBubble(true);
        if (onPasteToJira) {
          onPasteToJira(MOCK_BRD_RESPONSE);
        }
        setIsLoading(false);
      }, 500);
      return;
    }
    try {
      const aiAgentUrl = import.meta.env.VITE_AI_AGENT_URL as string;
      if (!aiAgentUrl) throw new Error('VITE_AI_AGENT_URL environment variable is not set');
      const bp = getFromSession('businessProcess');
      const ch = getFromSession('channel');
      const dt = getFromSession('deviceType');
      if (!bp || !ch || !dt) return;
      const queryText = `The user wants to work on the business process "${bp}", using the channel "${ch}", and the device type "${dt}".\nUser says: ${text}`;
      const processWorkflowUrl = import.meta.env.VITE_PROCESS_WORKFLOW_URL as string;
      const response = await fetch(processWorkflowUrl, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Bypass-Tunnel-Reminder': 'true'
         },
        body: JSON.stringify({ message: queryText }),
      });
      if (!response.ok) throw new Error('Failed to get response');
      const data = await response.json();
      let formattedResponse = data.response || data.message || data.content || 'No response received';
      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          text: formattedResponse,
          sender: 'bot',
          timestamp: new Date(),
          options: Array.isArray(data.options) ? data.options : Array.isArray(data.suggestions) ? data.suggestions : undefined,
        },
      ]);
      setLastAiResponse(formattedResponse);
      setShowNextStepBubble(true);
      // Paste to JIRA Stories only on the first backend response after step 3
      if (onPasteToJira && !hasPastedToJira) {
        onPasteToJira(formattedResponse);
        setHasPastedToJira(true);
      }
      if (data.suggestions && data.suggestions.length > 0) {
        const refinedRequirements = data.suggestions.join('\n\n');
        onRequirementsRefined(refinedRequirements);
      } else if ((data.response && data.response.includes('ready')) || data.response.includes('final')) {
        onRequirementsRefined(data.response);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          text: "I'm sorry, I'm having trouble connecting to the AI Requirements Assistant service. Please check if the service is running and try again.",
          sender: 'bot',
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (step < 3) return;
    sendMessage(inputText);
  };
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (step < 3) return;
      sendMessage(inputText);
    }
  };

  // Option click handler for backend options
  const handleBackendOptionClick = (option: string) => {
    sendMessage(option);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 z-50 p-4 rounded-full shadow-lg transition-all duration-300 ${isOpen ? 'bg-brand hover:bg-brand-dark text-white' : 'bg-brand hover:bg-brand-dark text-white'}`}
        title={isOpen ? 'Close Chat' : 'Open Requirements Assistant'}
      >
        {isOpen ? (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        )}
      </button>
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-40 w-[480px] h-[600px] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden">
          <div className="bg-brand text-white p-4 rounded-t-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-lg">AI Requirements Assistant</h3>
                  <p className="text-sm text-pink-100">Transform your ideas into structured requirements</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white hover:text-gray-200 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth relative" onScroll={handleScroll}>
            {messages.map((message, idx) => (
              <div key={message.id} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${message.sender === 'user' ? 'bg-brand text-white shadow-lg' : 'bg-white border border-gray-200 text-gray-800 shadow-sm'} relative`}>
                  <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.text}</p>
                  <p className={`text-xs mt-2 ${message.sender === 'user' ? 'opacity-70' : 'text-gray-500'}`}>{message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                  {/* Copy icon for bot messages at bottom right */}
                  {message.sender === 'bot' && (
                    <button
                      className="absolute bottom-2 right-2 p-1 rounded hover:bg-gray-100 transition-colors"
                      title="Copy response"
                      onClick={async () => {
                        await navigator.clipboard.writeText(message.text);
                        setCopiedMsgId(message.id);
                        setTimeout(() => setCopiedMsgId(null), 1200);
                      }}
                    >
                      {copiedMsgId === message.id ? (
                        <Check className="w-4 h-4 text-green-600" />
                      ) : (
                        <Clipboard className="w-4 h-4 text-gray-400" />
                      )}
                    </button>
                  )}
                  {/* Render options for bot messages (first 3 steps or backend options) */}
                  {message.sender === 'bot' && message.options && message.options.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {message.options.map((option, i) => (
                        <button
                          key={i}
                          onClick={() => (step < 3 ? handleOptionSelect(option) : handleBackendOptionClick(option))}
                          className="px-3 py-1 rounded-lg bg-brand text-white hover:bg-brand-dark transition-colors text-sm font-medium shadow"
                          disabled={isLoading}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-200 text-gray-800 px-4 py-3 rounded-2xl shadow-sm">
                  <div className="flex items-center space-x-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-brand rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-brand rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-brand rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                    <span className="text-sm font-medium">AI is thinking...</span>
                  </div>
                </div>
              </div>
            )}
            {showNextStepBubble && lastAiResponse && (
              <div className="flex justify-start">
                <div className="max-w-xs lg:max-w-md px-4 py-3 rounded-2xl bg-yellow-50 border border-yellow-200 text-yellow-900 shadow-sm relative mt-2">
                  <p className="text-sm mb-2">Copy the requirements above and paste them in the next step, or use the button below to continue.</p>
                  <button
                    className="px-3 py-1 rounded-lg bg-brand text-white hover:bg-brand-dark transition-colors text-sm font-medium shadow"
                    onClick={() => {
                      if (onPasteToJira && lastAiResponse) {
                        onPasteToJira(lastAiResponse);
                        setShowNextStepBubble(false);
                      }
                    }}
                  >
                    Go to Next Step
                  </button>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
            {!shouldAutoScroll && (
              <button
                onClick={() => {
                  setShouldAutoScroll(true);
                  scrollToBottom();
                }}
                className="absolute bottom-4 right-4 bg-brand text-white p-2 rounded-full shadow-lg hover:bg-brand-dark transition-colors"
                title="Scroll to bottom"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              </button>
            )}
          </div>
          <div className="p-4 border-t border-gray-200 bg-gray-50">
            <form onSubmit={handleSubmit} className="flex space-x-2">
              <input
                type="text"
                value={inputText}
                onChange={e => setInputText(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent bg-white"
                disabled={isLoading || step < 3}
              />
              <button
                type="submit"
                disabled={isLoading || !inputText.trim() || step < 3}
                className="px-4 py-3 bg-brand text-white rounded-xl hover:bg-brand-dark focus:outline-none focus:ring-2 focus:ring-brand disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
