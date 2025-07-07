import { JiraOutput, JiraEpic, JiraStory } from '../types/jira';

export class RequirementsParser {
  private static readonly FEATURE_KEYWORDS = [
    'user', 'admin', 'authentication', 'login', 'signup', 'dashboard', 
    'profile', 'settings', 'notification', 'payment', 'search', 'filter',
    'report', 'analytics', 'integration', 'api', 'mobile', 'responsive'
  ];

  private static readonly COMPLEXITY_INDICATORS = {
    HIGH: ['integration', 'api', 'authentication', 'payment', 'security', 'analytics'],
    MEDIUM: ['dashboard', 'profile', 'settings', 'notification', 'search', 'filter'],
    LOW: ['button', 'text', 'display', 'color', 'theme', 'responsive']
  };

  static analyzeRequirements(requirements: string): JiraOutput {
    const sentences = this.splitIntoSentences(requirements);
    const epics = this.extractEpics(sentences);
    const enrichedEpics = this.enrichEpicsWithStories(epics, sentences);
    
    return this.formatOutput(enrichedEpics);
  }

  private static splitIntoSentences(text: string): string[] {
    return text
      .split(/[.!?]+/)
      .map(s => s.trim())
      .filter(s => s.length > 10);
  }

  private static extractEpics(sentences: string[]): Map<string, string[]> {
    const epics = new Map<string, string[]>();
    
    sentences.forEach(sentence => {
      const epicCategory = this.categorizeEpic(sentence);
      if (!epics.has(epicCategory)) {
        epics.set(epicCategory, []);
      }
      epics.get(epicCategory)!.push(sentence);
    });

    return epics;
  }

  private static categorizeEpic(sentence: string): string {
    const lower = sentence.toLowerCase();
    
    if (lower.includes('auth') || lower.includes('login') || lower.includes('signup') || lower.includes('sign up')) {
      return 'User Authentication & Onboarding';
    }
    if (lower.includes('admin') || lower.includes('moderate') || lower.includes('manage')) {
      return 'Admin & Content Management';
    }
    if (lower.includes('create') || lower.includes('generate') || lower.includes('art') || lower.includes('content')) {
      return 'Content Creation & Management';
    }
    if (lower.includes('mobile') || lower.includes('responsive') || lower.includes('dark mode') || lower.includes('theme')) {
      return 'UI/UX & Responsive Design';
    }
    if (lower.includes('download') || lower.includes('export') || lower.includes('share')) {
      return 'Export & Sharing Features';
    }
    if (lower.includes('payment') || lower.includes('billing') || lower.includes('subscription')) {
      return 'Payment & Billing';
    }
    if (lower.includes('search') || lower.includes('filter') || lower.includes('analytics') || lower.includes('report')) {
      return 'Search & Analytics';
    }
    
    return 'Core Platform Features';
  }

  private static enrichEpicsWithStories(epics: Map<string, string[]>, sentences: string[]): JiraEpic[] {
    const enrichedEpics: JiraEpic[] = [];

    epics.forEach((epicSentences, epicTitle) => {
      const stories = this.generateStoriesForEpic(epicSentences, epicTitle);
      const features = this.extractFeatures(epicSentences);
      
      enrichedEpics.push({
        title: epicTitle,
        description: this.generateEpicDescription(epicTitle, epicSentences),
        features,
        stories
      });
    });

    return enrichedEpics;
  }

  private static generateStoriesForEpic(sentences: string[], epicTitle: string): JiraStory[] {
    const stories: JiraStory[] = [];
    
    sentences.forEach(sentence => {
      const storyTitle = this.generateStoryTitle(sentence);
      const storyDescription = this.generateStoryDescription(sentence);
      const acceptanceCriteria = this.generateAcceptanceCriteria(sentence);
      const priority = this.determinePriority(sentence);
      const storyPoints = this.estimateStoryPoints(sentence);
      
      stories.push({
        title: storyTitle,
        description: storyDescription,
        acceptance_criteria: acceptanceCriteria,
        type: 'Feature',
        priority,
        story_points: storyPoints
      });
    });

    return stories;
  }

  private static generateStoryTitle(sentence: string): string {
    const words = sentence.split(' ');
    const title = words.slice(0, 8).join(' ');
    return title.charAt(0).toUpperCase() + title.slice(1);
  }

  private static generateStoryDescription(sentence: string): string {
    const baseDescription = `As a user, I want to ${sentence.toLowerCase()}`;
    return baseDescription.charAt(0).toUpperCase() + baseDescription.slice(1) + '.';
  }

  private static generateAcceptanceCriteria(sentence: string): string[] {
    const criteria = [];
    const lower = sentence.toLowerCase();
    
    if (lower.includes('signup') || lower.includes('sign up')) {
      criteria.push('Given a user visits the signup page, when they provide valid information, then they should be registered successfully');
      criteria.push('Given a user completes signup, when they verify their email, then they should be redirected to the dashboard');
    } else if (lower.includes('login')) {
      criteria.push('Given a user enters valid credentials, when they click login, then they should be authenticated and redirected to the dashboard');
      criteria.push('Given a user enters invalid credentials, when they click login, then they should see an error message');
    } else if (lower.includes('create') || lower.includes('generate')) {
      criteria.push('Given a user is authenticated, when they request to create content, then the system should generate the content successfully');
      criteria.push('Given content is generated, when the user views it, then it should be displayed correctly');
    } else if (lower.includes('download') || lower.includes('export')) {
      criteria.push('Given a user has created content, when they click download, then the file should be downloaded in the specified format');
      criteria.push('Given a download is initiated, when the file is ready, then the user should receive a download link');
    } else {
      criteria.push('Given a user performs this action, when the system processes it, then the expected result should be achieved');
      criteria.push('Given the feature is implemented, when users interact with it, then it should function as expected');
    }
    
    return criteria;
  }

  private static determinePriority(sentence: string): 'High' | 'Medium' | 'Low' {
    const lower = sentence.toLowerCase();
    
    if (lower.includes('must') || lower.includes('required') || lower.includes('critical') || 
        lower.includes('auth') || lower.includes('security') || lower.includes('payment')) {
      return 'High';
    }
    if (lower.includes('should') || lower.includes('important') || lower.includes('user') || 
        lower.includes('create') || lower.includes('manage')) {
      return 'Medium';
    }
    return 'Low';
  }

  private static estimateStoryPoints(sentence: string): number {
    const lower = sentence.toLowerCase();
    
    // High complexity (8-13 points)
    if (this.COMPLEXITY_INDICATORS.HIGH.some(keyword => lower.includes(keyword))) {
      return Math.floor(Math.random() * 6) + 8; // 8-13
    }
    
    // Medium complexity (3-8 points)
    if (this.COMPLEXITY_INDICATORS.MEDIUM.some(keyword => lower.includes(keyword))) {
      return Math.floor(Math.random() * 6) + 3; // 3-8
    }
    
    // Low complexity (1-3 points)
    return Math.floor(Math.random() * 3) + 1; // 1-3
  }

  private static extractFeatures(sentences: string[]): string[] {
    const features = new Set<string>();
    
    sentences.forEach(sentence => {
      const lower = sentence.toLowerCase();
      this.FEATURE_KEYWORDS.forEach(keyword => {
        if (lower.includes(keyword)) {
          features.add(this.formatFeature(keyword, sentence));
        }
      });
    });
    
    return Array.from(features);
  }

  private static formatFeature(keyword: string, sentence: string): string {
    const context = sentence.split(' ').slice(0, 5).join(' ');
    return `${keyword.charAt(0).toUpperCase() + keyword.slice(1)} functionality`;
  }

  private static generateEpicDescription(title: string, sentences: string[]): string {
    const mainSentence = sentences[0] || '';
    return `Enable ${title.toLowerCase()} functionality to support ${mainSentence.toLowerCase()}.`;
  }

  private static formatOutput(epics: JiraEpic[]): JiraOutput {
    const totalStories = epics.reduce((sum, epic) => sum + epic.stories.length, 0);
    const totalPoints = epics.reduce((sum, epic) => 
      sum + epic.stories.reduce((storySum, story) => storySum + story.story_points, 0), 0);

    return {
      epics,
      metadata: {
        total_epics: epics.length,
        total_stories: totalStories,
        estimated_total_points: totalPoints,
        generated_at: new Date().toISOString()
      }
    };
  }
}