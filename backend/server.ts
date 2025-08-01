import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { fetchJiraIssues } from './integrations/jira';
import { fetchConfluencePages } from './integrations/confluence';

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

// Jira ingestion endpoint with env fallback
app.post('/api/ingest/jira', async (req, res) => {
  const domain = req.body.domain || process.env.JIRA_DOMAIN;
  const projectKey = req.body.projectKey;
  const accessToken = req.body.accessToken || process.env.JIRA_ACCESS_TOKEN;
  if (!domain || !projectKey || !accessToken) {
    return res.status(400).json({ error: 'Missing required fields: domain, projectKey, accessToken' });
  }
  try {

    const issues = await fetchJiraIssues("wiki.telekom.de", "OAGGARD", accessToken);
    res.json({ issues });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Confluence ingestion endpoint with env fallback
app.post('/api/ingest/confluence', async (req, res) => {
  const domain = req.body.domain || process.env.CONFLUENCE_DOMAIN;
  const spaceKey = req.body.spaceKey;
  const accessToken = req.body.accessToken || process.env.CONFLUENCE_ACCESS_TOKEN;
  const contentType = req.body.contentType || 'page';
  if (!domain || !spaceKey || !accessToken) {
    return res.status(400).json({ error: 'Missing required fields: domain, spaceKey, accessToken' });
  }
  try {
    const pages = await fetchConfluencePages("wiki.telekom.de", "OAGGARD", accessToken, contentType);
    res.json({ pages });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Proxy endpoint to forward requests to external Expert Business Analyst service
app.post('/api/ask', async (req, res) => {
  try {
    const aiAgentUrl = process.env.VITE_AI_AGENT_URL || 'http://127.0.0.1:8000';
    
    // Ensure we don't double-append /ask
    const endpointUrl = aiAgentUrl.endsWith('/ask') ? aiAgentUrl : `${aiAgentUrl}/ask`;
    const response = await fetch(endpointUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(req.body),
    });

    if (!response.ok) {
      throw new Error(`External service responded with status: ${response.status}`);
    }

    const data = await response.json();
    res.json(data);
  } catch (err: any) {
    console.error('Error forwarding to external service:', err);
    res.status(500).json({ 
      error: 'Unable to connect to Expert Business Analyst service',
      details: err.message 
    });
  }
});

// Chat endpoint for AI assistant (keeping for backward compatibility)
app.post('/api/chat', async (req, res) => {
  const { message, conversationHistory } = req.body;
  
  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  try {
    // Simple AI response logic - in production, you'd integrate with OpenAI or similar
    let response = '';
    let suggestions: string[] = [];

    // Analyze the message and provide contextual responses
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('project') || lowerMessage.includes('app') || lowerMessage.includes('system')) {
      response = "Great! I'd love to help you with your project. Could you tell me more about:\n\n1. What type of application are you building?\n2. Who are your target users?\n3. What are the main features you need?\n4. Any specific technical requirements or constraints?";
    } else if (lowerMessage.includes('user') || lowerMessage.includes('customer') || lowerMessage.includes('audience')) {
      response = "Understanding your users is crucial! Please describe:\n\n1. Who will be using your application?\n2. What problems are you solving for them?\n3. What are their technical skill levels?\n4. How many users do you expect?";
    } else if (lowerMessage.includes('feature') || lowerMessage.includes('functionality')) {
      response = "Let's break down the features! Please specify:\n\n1. What are the core features you need?\n2. Any specific integrations required?\n3. Performance requirements?\n4. Security considerations?";
    } else if (lowerMessage.includes('tech') || lowerMessage.includes('technology') || lowerMessage.includes('stack')) {
      response = "Technology choices are important! Tell me about:\n\n1. Any preferred programming languages or frameworks?\n2. Database requirements?\n3. Deployment preferences (cloud, on-premise)?\n4. Integration needs with existing systems?";
    } else if (lowerMessage.includes('timeline') || lowerMessage.includes('deadline') || lowerMessage.includes('budget')) {
      response = "Project planning is key! Please share:\n\n1. What's your target launch date?\n2. Available budget or resources?\n3. Team size and expertise?\n4. Any critical milestones?";
    } else if (lowerMessage.includes('ready') || lowerMessage.includes('complete') || lowerMessage.includes('done')) {
      response = "Perfect! Based on our conversation, I can help you create structured requirements. Would you like me to generate:\n\n1. JIRA user stories and epics\n2. System architecture diagrams\n3. Comprehensive test plans\n\nJust let me know what you'd prefer!";
      suggestions = [
        "Generate JIRA stories for my project",
        "Create architecture diagrams",
        "Generate test plans and cases"
      ];
    } else {
      response = "I'm here to help you refine your project requirements! Please tell me more about your project goals, target users, main features, or any specific requirements you have in mind.";
    }

    res.json({ 
      response,
      suggestions: suggestions.length > 0 ? suggestions : undefined
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
