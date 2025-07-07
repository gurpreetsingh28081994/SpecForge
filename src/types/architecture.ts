export interface TechStackRecommendation {
  category: string;
  primary: string;
  alternatives: string[];
  reasoning: string;
}

export interface ArchitectureComponent {
  id: string;
  name: string;
  type: 'frontend' | 'backend' | 'database' | 'service' | 'external' | 'infrastructure';
  description: string;
  technologies: string[];
  connections: string[];
}

export interface ArchitectureDiagram {
  type: 'high-level' | 'low-level';
  title: string;
  description: string;
  components: ArchitectureComponent[];
  mermaidCode: string;
  plantUmlCode: string;
}

export interface ArchitectureOutput {
  projectType: string;
  scalabilityRequirements: string;
  highLevelDiagram: ArchitectureDiagram;
  lowLevelDiagram: ArchitectureDiagram;
  techStack: TechStackRecommendation[];
  deploymentStrategy: {
    type: string;
    description: string;
    components: string[];
  };
  metadata: {
    generated_at: string;
    complexity_score: number;
    estimated_team_size: string;
    estimated_timeline: string;
  };
}