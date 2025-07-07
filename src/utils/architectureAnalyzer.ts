import { ArchitectureOutput, ArchitectureDiagram, TechStackRecommendation, ArchitectureComponent } from '../types/architecture';

export class ArchitectureAnalyzer {
  private static readonly PROJECT_TYPES = {
    SAAS: ['saas', 'software as a service', 'subscription', 'multi-tenant'],
    ECOMMERCE: ['ecommerce', 'e-commerce', 'marketplace', 'shop', 'store', 'buy', 'sell', 'payment'],
    SOCIAL: ['social', 'community', 'chat', 'messaging', 'feed', 'share'],
    ANALYTICS: ['analytics', 'dashboard', 'reporting', 'metrics', 'data'],
    CONTENT: ['cms', 'blog', 'content', 'publishing', 'media'],
    FINTECH: ['fintech', 'banking', 'finance', 'trading', 'investment'],
    HEALTHCARE: ['healthcare', 'medical', 'patient', 'doctor', 'clinic'],
    EDUCATION: ['education', 'learning', 'course', 'student', 'teacher']
  };

  private static readonly COMPLEXITY_INDICATORS = {
    HIGH: ['ai', 'machine learning', 'real-time', 'streaming', 'microservices', 'blockchain', 'payment', 'analytics'],
    MEDIUM: ['authentication', 'api', 'database', 'search', 'notification', 'file upload'],
    LOW: ['crud', 'basic', 'simple', 'static', 'display']
  };

  static analyzeArchitecture(requirements: string): ArchitectureOutput {
    const projectType = this.detectProjectType(requirements);
    const complexity = this.calculateComplexity(requirements);
    const scalability = this.determineScalabilityRequirements(requirements, complexity);
    
    const components = this.extractComponents(requirements, projectType);
    const techStack = this.recommendTechStack(projectType, complexity, requirements);
    
    const highLevelDiagram = this.generateHighLevelDiagram(components, projectType);
    const lowLevelDiagram = this.generateLowLevelDiagram(components, projectType, requirements);
    
    const deploymentStrategy = this.recommendDeploymentStrategy(complexity, projectType);
    
    return {
      projectType,
      scalabilityRequirements: scalability,
      highLevelDiagram,
      lowLevelDiagram,
      techStack,
      deploymentStrategy,
      metadata: {
        generated_at: new Date().toISOString(),
        complexity_score: complexity,
        estimated_team_size: this.estimateTeamSize(complexity),
        estimated_timeline: this.estimateTimeline(complexity, components.length)
      }
    };
  }

  private static detectProjectType(requirements: string): string {
    const lower = requirements.toLowerCase();
    
    for (const [type, keywords] of Object.entries(this.PROJECT_TYPES)) {
      if (keywords.some(keyword => lower.includes(keyword))) {
        return type;
      }
    }
    
    return 'WEB_APPLICATION';
  }

  private static calculateComplexity(requirements: string): number {
    const lower = requirements.toLowerCase();
    let score = 1;
    
    // High complexity features
    this.COMPLEXITY_INDICATORS.HIGH.forEach(indicator => {
      if (lower.includes(indicator)) score += 3;
    });
    
    // Medium complexity features
    this.COMPLEXITY_INDICATORS.MEDIUM.forEach(indicator => {
      if (lower.includes(indicator)) score += 2;
    });
    
    // Low complexity features
    this.COMPLEXITY_INDICATORS.LOW.forEach(indicator => {
      if (lower.includes(indicator)) score += 1;
    });
    
    return Math.min(score, 10);
  }

  private static determineScalabilityRequirements(requirements: string, complexity: number): string {
    const lower = requirements.toLowerCase();
    
    if (lower.includes('million') || lower.includes('global') || complexity >= 8) {
      return 'High - Global scale, millions of users, microservices architecture';
    } else if (lower.includes('thousand') || lower.includes('enterprise') || complexity >= 5) {
      return 'Medium - Regional scale, thousands of users, modular monolith or microservices';
    } else {
      return 'Low - Local scale, hundreds of users, monolithic architecture';
    }
  }

  private static extractComponents(requirements: string, projectType: string): ArchitectureComponent[] {
    const components: ArchitectureComponent[] = [];
    const lower = requirements.toLowerCase();
    
    // Always include basic components
    components.push({
      id: 'frontend',
      name: 'Frontend Application',
      type: 'frontend',
      description: 'User interface and client-side logic',
      technologies: ['React', 'TypeScript', 'Tailwind CSS'],
      connections: ['backend-api']
    });

    components.push({
      id: 'backend-api',
      name: 'Backend API',
      type: 'backend',
      description: 'Core business logic and API endpoints',
      technologies: ['Node.js', 'Express', 'TypeScript'],
      connections: ['database', 'frontend']
    });

    components.push({
      id: 'database',
      name: 'Primary Database',
      type: 'database',
      description: 'Main data storage',
      technologies: ['PostgreSQL'],
      connections: ['backend-api']
    });

    // Add conditional components based on requirements
    if (lower.includes('auth') || lower.includes('login') || lower.includes('signup')) {
      components.push({
        id: 'auth-service',
        name: 'Authentication Service',
        type: 'service',
        description: 'User authentication and authorization',
        technologies: ['Firebase Auth', 'JWT'],
        connections: ['backend-api', 'frontend']
      });
    }

    if (lower.includes('payment') || lower.includes('billing') || lower.includes('subscription')) {
      components.push({
        id: 'payment-gateway',
        name: 'Payment Gateway',
        type: 'external',
        description: 'Payment processing',
        technologies: ['Stripe', 'Razorpay'],
        connections: ['backend-api']
      });
    }

    if (lower.includes('file') || lower.includes('upload') || lower.includes('image') || lower.includes('media')) {
      components.push({
        id: 'file-storage',
        name: 'File Storage',
        type: 'service',
        description: 'File and media storage',
        technologies: ['AWS S3', 'Cloudinary'],
        connections: ['backend-api']
      });
    }

    if (lower.includes('email') || lower.includes('notification') || lower.includes('sms')) {
      components.push({
        id: 'notification-service',
        name: 'Notification Service',
        type: 'service',
        description: 'Email and push notifications',
        technologies: ['SendGrid', 'Firebase Cloud Messaging'],
        connections: ['backend-api']
      });
    }

    if (lower.includes('analytics') || lower.includes('tracking') || lower.includes('metrics')) {
      components.push({
        id: 'analytics',
        name: 'Analytics Service',
        type: 'service',
        description: 'User analytics and tracking',
        technologies: ['PostHog', 'Google Analytics'],
        connections: ['frontend', 'backend-api']
      });
    }

    if (lower.includes('search') || lower.includes('elasticsearch')) {
      components.push({
        id: 'search-service',
        name: 'Search Service',
        type: 'service',
        description: 'Full-text search capabilities',
        technologies: ['Elasticsearch', 'Algolia'],
        connections: ['backend-api']
      });
    }

    if (lower.includes('cache') || lower.includes('redis') || lower.includes('performance')) {
      components.push({
        id: 'cache',
        name: 'Cache Layer',
        type: 'service',
        description: 'Application caching',
        technologies: ['Redis', 'Memcached'],
        connections: ['backend-api']
      });
    }

    return components;
  }

  private static recommendTechStack(projectType: string, complexity: number, requirements: string): TechStackRecommendation[] {
    const recommendations: TechStackRecommendation[] = [];
    const lower = requirements.toLowerCase();

    // Frontend
    recommendations.push({
      category: 'Frontend Framework',
      primary: 'React',
      alternatives: ['Vue.js', 'Svelte', 'Angular'],
      reasoning: 'React offers excellent ecosystem, TypeScript support, and component reusability. Perfect for complex UIs.'
    });

    // Backend
    if (complexity >= 7) {
      recommendations.push({
        category: 'Backend Framework',
        primary: 'Node.js with Express',
        alternatives: ['FastAPI (Python)', 'Spring Boot (Java)', 'ASP.NET Core'],
        reasoning: 'Node.js provides excellent performance for I/O operations and shares language with frontend.'
      });
    } else {
      recommendations.push({
        category: 'Backend Framework',
        primary: 'Node.js with Express',
        alternatives: ['Next.js API Routes', 'Fastify'],
        reasoning: 'Express is lightweight and perfect for moderate complexity applications.'
      });
    }

    // Database
    if (lower.includes('nosql') || lower.includes('document') || projectType === 'SOCIAL') {
      recommendations.push({
        category: 'Database',
        primary: 'MongoDB',
        alternatives: ['PostgreSQL with JSONB', 'DynamoDB'],
        reasoning: 'Document database ideal for flexible schemas and rapid development.'
      });
    } else {
      recommendations.push({
        category: 'Database',
        primary: 'PostgreSQL',
        alternatives: ['MySQL', 'MongoDB'],
        reasoning: 'PostgreSQL offers excellent performance, ACID compliance, and advanced features.'
      });
    }

    // Authentication
    if (lower.includes('auth') || lower.includes('login')) {
      recommendations.push({
        category: 'Authentication',
        primary: 'Firebase Auth',
        alternatives: ['Auth0', 'Supabase Auth', 'Custom JWT'],
        reasoning: 'Firebase Auth provides easy OAuth integration and handles security best practices.'
      });
    }

    // Deployment
    if (complexity >= 8) {
      recommendations.push({
        category: 'Deployment',
        primary: 'AWS with Docker',
        alternatives: ['Google Cloud Platform', 'Azure', 'Kubernetes'],
        reasoning: 'AWS provides comprehensive services for enterprise-scale applications.'
      });
    } else {
      recommendations.push({
        category: 'Deployment',
        primary: 'Vercel + Railway',
        alternatives: ['Netlify + Heroku', 'AWS Amplify'],
        reasoning: 'Vercel and Railway offer excellent developer experience for moderate-scale applications.'
      });
    }

    // State Management
    if (complexity >= 6) {
      recommendations.push({
        category: 'State Management',
        primary: 'Zustand',
        alternatives: ['Redux Toolkit', 'Recoil', 'Context API'],
        reasoning: 'Zustand provides simple yet powerful state management without boilerplate.'
      });
    }

    // Styling
    recommendations.push({
      category: 'Styling',
      primary: 'Tailwind CSS',
      alternatives: ['Styled Components', 'Emotion', 'CSS Modules'],
      reasoning: 'Tailwind CSS enables rapid UI development with consistent design systems.'
    });

    return recommendations;
  }

  private static generateHighLevelDiagram(components: ArchitectureComponent[], projectType: string): ArchitectureDiagram {
    const mermaidCode = this.generateMermaidHLD(components);
    const plantUmlCode = this.generatePlantUMLHLD(components);

    return {
      type: 'high-level',
      title: `${projectType} High-Level Architecture`,
      description: 'System overview showing main components and their relationships',
      components,
      mermaidCode,
      plantUmlCode
    };
  }

  private static generateLowLevelDiagram(components: ArchitectureComponent[], projectType: string, requirements: string): ArchitectureDiagram {
    const mermaidCode = this.generateMermaidLLD(components, requirements);
    const plantUmlCode = this.generatePlantUMLLLD(components, requirements);

    return {
      type: 'low-level',
      title: `${projectType} Low-Level Architecture`,
      description: 'Detailed component interactions and data flow',
      components,
      mermaidCode,
      plantUmlCode
    };
  }

  private static generateMermaidHLD(components: ArchitectureComponent[]): string {
    let mermaid = 'graph TD\n';
    
    components.forEach(component => {
      const shape = this.getMermaidShape(component.type);
      mermaid += `    ${component.id}${shape}${component.name}${shape.split('[')[1]}\n`;
    });

    mermaid += '\n';

    components.forEach(component => {
      component.connections.forEach(connection => {
        if (components.find(c => c.id === connection)) {
          mermaid += `    ${component.id} --> ${connection}\n`;
        }
      });
    });

    // Add styling
    mermaid += '\n    classDef frontend fill:#e1f5fe\n';
    mermaid += '    classDef backend fill:#f3e5f5\n';
    mermaid += '    classDef database fill:#e8f5e8\n';
    mermaid += '    classDef service fill:#fff3e0\n';
    mermaid += '    classDef external fill:#ffebee\n';

    components.forEach(component => {
      mermaid += `    class ${component.id} ${component.type}\n`;
    });

    return mermaid;
  }

  private static generateMermaidLLD(components: ArchitectureComponent[], requirements: string): string {
    let mermaid = 'sequenceDiagram\n';
    mermaid += '    participant U as User\n';
    mermaid += '    participant F as Frontend\n';
    mermaid += '    participant A as API\n';
    mermaid += '    participant D as Database\n';
    
    if (components.find(c => c.id === 'auth-service')) {
      mermaid += '    participant Auth as Auth Service\n';
    }
    if (components.find(c => c.id === 'payment-gateway')) {
      mermaid += '    participant Pay as Payment Gateway\n';
    }

    mermaid += '\n    U->>F: User Action\n';
    mermaid += '    F->>A: API Request\n';
    
    if (components.find(c => c.id === 'auth-service')) {
      mermaid += '    A->>Auth: Validate Token\n';
      mermaid += '    Auth-->>A: Token Valid\n';
    }
    
    mermaid += '    A->>D: Query Data\n';
    mermaid += '    D-->>A: Return Data\n';
    
    if (components.find(c => c.id === 'payment-gateway')) {
      mermaid += '    A->>Pay: Process Payment\n';
      mermaid += '    Pay-->>A: Payment Result\n';
    }
    
    mermaid += '    A-->>F: API Response\n';
    mermaid += '    F-->>U: Updated UI\n';

    return mermaid;
  }

  private static generatePlantUMLHLD(components: ArchitectureComponent[]): string {
    let plantuml = '@startuml\n!theme plain\n\n';
    
    // Define components
    components.forEach(component => {
      const stereotype = this.getPlantUMLStereotype(component.type);
      plantuml += `component "${component.name}" as ${component.id} ${stereotype}\n`;
    });

    plantuml += '\n';

    // Define connections
    components.forEach(component => {
      component.connections.forEach(connection => {
        if (components.find(c => c.id === connection)) {
          plantuml += `${component.id} --> ${connection}\n`;
        }
      });
    });

    plantuml += '\n@enduml';
    return plantuml;
  }

  private static generatePlantUMLLLD(components: ArchitectureComponent[], requirements: string): string {
    let plantuml = '@startuml\n!theme plain\n\n';
    plantuml += 'actor User\n';
    plantuml += 'participant Frontend\n';
    plantuml += 'participant "API Gateway" as API\n';
    plantuml += 'database "Database" as DB\n';

    if (components.find(c => c.id === 'auth-service')) {
      plantuml += 'participant "Auth Service" as Auth\n';
    }

    plantuml += '\nUser -> Frontend: User Action\n';
    plantuml += 'Frontend -> API: HTTP Request\n';
    
    if (components.find(c => c.id === 'auth-service')) {
      plantuml += 'API -> Auth: Validate Token\n';
      plantuml += 'Auth --> API: Token Valid\n';
    }
    
    plantuml += 'API -> DB: Query\n';
    plantuml += 'DB --> API: Data\n';
    plantuml += 'API --> Frontend: Response\n';
    plantuml += 'Frontend --> User: Updated UI\n';

    plantuml += '\n@enduml';
    return plantuml;
  }

  private static getMermaidShape(type: string): string {
    switch (type) {
      case 'frontend': return '[';
      case 'backend': return '(';
      case 'database': return '[(';
      case 'service': return '{{';
      case 'external': return '>';
      default: return '[';
    }
  }

  private static getPlantUMLStereotype(type: string): string {
    switch (type) {
      case 'frontend': return '<<UI>>';
      case 'backend': return '<<Service>>';
      case 'database': return '<<Database>>';
      case 'service': return '<<Service>>';
      case 'external': return '<<External>>';
      default: return '';
    }
  }

  private static recommendDeploymentStrategy(complexity: number, projectType: string): any {
    if (complexity >= 8) {
      return {
        type: 'Microservices with Kubernetes',
        description: 'Container orchestration for high scalability and resilience',
        components: ['Docker containers', 'Kubernetes cluster', 'Load balancer', 'Service mesh']
      };
    } else if (complexity >= 5) {
      return {
        type: 'Containerized Monolith',
        description: 'Docker containers with cloud deployment for moderate scale',
        components: ['Docker containers', 'Cloud hosting', 'CDN', 'Database cluster']
      };
    } else {
      return {
        type: 'Serverless/JAMstack',
        description: 'Serverless functions with static hosting for cost efficiency',
        components: ['Static hosting', 'Serverless functions', 'Managed database', 'CDN']
      };
    }
  }

  private static estimateTeamSize(complexity: number): string {
    if (complexity >= 8) return '8-12 developers';
    if (complexity >= 5) return '4-6 developers';
    return '2-3 developers';
  }

  private static estimateTimeline(complexity: number, componentCount: number): string {
    const baseWeeks = Math.max(4, componentCount * 2);
    const complexityMultiplier = complexity / 5;
    const totalWeeks = Math.ceil(baseWeeks * complexityMultiplier);
    
    if (totalWeeks >= 52) return '12+ months';
    if (totalWeeks >= 24) return '6-12 months';
    if (totalWeeks >= 12) return '3-6 months';
    return '1-3 months';
  }
}