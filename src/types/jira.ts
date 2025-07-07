export interface JiraStory {
  title: string;
  description: string;
  acceptance_criteria: string[];
  type: 'Feature' | 'Bug' | 'Chore';
  priority: 'High' | 'Medium' | 'Low';
  story_points: number;
}

export interface JiraEpic {
  title: string;
  description: string;
  features: string[];
  stories: JiraStory[];
}

export interface JiraOutput {
  epics: JiraEpic[];
  metadata: {
    total_epics: number;
    total_stories: number;
    estimated_total_points: number;
    generated_at: string;
  };
}

export interface AnalysisResult {
  success: boolean;
  data?: JiraOutput;
  error?: string;
}