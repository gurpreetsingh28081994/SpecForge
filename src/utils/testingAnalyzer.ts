import { TestingOutput, TestPlan, TestSuite, TestCase, TestStep } from '../types/testing';

export class TestingAnalyzer {
  private static readonly TEST_TYPES = {
    FUNCTIONAL: ['login', 'signup', 'create', 'update', 'delete', 'search', 'filter'],
    INTEGRATION: ['api', 'payment', 'oauth', 'third-party', 'external', 'service'],
    SECURITY: ['auth', 'permission', 'access', 'security', 'validation', 'sanitization'],
    PERFORMANCE: ['load', 'stress', 'performance', 'speed', 'concurrent', 'scalability'],
    REGRESSION: ['existing', 'previous', 'core', 'critical', 'main'],
    EDGE_CASE: ['boundary', 'limit', 'maximum', 'minimum', 'edge', 'corner']
  };

  private static readonly AUTOMATION_TOOLS = {
    FRONTEND: ['Cypress', 'Playwright', 'Selenium', 'TestCafe'],
    API: ['Postman', 'REST Assured', 'Supertest', 'Insomnia'],
    MOBILE: ['Appium', 'Detox', 'Espresso', 'XCUITest'],
    PERFORMANCE: ['JMeter', 'K6', 'Artillery', 'LoadRunner'],
    SECURITY: ['OWASP ZAP', 'Burp Suite', 'SonarQube', 'Snyk']
  };

  private static readonly PRIORITY_KEYWORDS = {
    HIGH: ['must', 'critical', 'required', 'essential', 'auth', 'payment', 'security'],
    MEDIUM: ['should', 'important', 'user', 'feature', 'functionality'],
    LOW: ['could', 'nice', 'optional', 'enhancement', 'ui', 'cosmetic']
  };

  static analyzeForTesting(requirements: string): TestingOutput {
    const sentences = this.splitIntoSentences(requirements);
    const projectType = this.detectProjectType(requirements);
    const complexity = this.calculateComplexity(requirements);
    
    const testPlan = this.generateTestPlan(requirements, projectType, complexity);
    const testSuites = this.generateTestSuites(sentences, projectType);
    const automationRecommendations = this.generateAutomationRecommendations(projectType, complexity, testSuites);
    const metrics = this.calculateMetrics(testSuites);

    return {
      test_plan: testPlan,
      test_suites: testSuites,
      automation_recommendations: automationRecommendations,
      metrics,
      metadata: {
        generated_at: new Date().toISOString(),
        requirements_analyzed: sentences.length,
        complexity_score: complexity
      }
    };
  }

  private static splitIntoSentences(text: string): string[] {
    return text
      .split(/[.!?]+/)
      .map(s => s.trim())
      .filter(s => s.length > 10);
  }

  private static detectProjectType(requirements: string): string {
    const lower = requirements.toLowerCase();
    
    if (lower.includes('ecommerce') || lower.includes('shop') || lower.includes('buy') || lower.includes('sell')) {
      return 'E-commerce Platform';
    }
    if (lower.includes('social') || lower.includes('chat') || lower.includes('share') || lower.includes('community')) {
      return 'Social Platform';
    }
    if (lower.includes('dashboard') || lower.includes('analytics') || lower.includes('report')) {
      return 'Analytics Dashboard';
    }
    if (lower.includes('cms') || lower.includes('content') || lower.includes('blog')) {
      return 'Content Management System';
    }
    if (lower.includes('saas') || lower.includes('subscription') || lower.includes('tenant')) {
      return 'SaaS Application';
    }
    
    return 'Web Application';
  }

  private static calculateComplexity(requirements: string): number {
    const lower = requirements.toLowerCase();
    let score = 1;
    
    const complexityIndicators = [
      'authentication', 'payment', 'api', 'integration', 'real-time', 
      'notification', 'analytics', 'security', 'oauth', 'microservice'
    ];
    
    complexityIndicators.forEach(indicator => {
      if (lower.includes(indicator)) score += 1;
    });
    
    return Math.min(score, 10);
  }

  private static generateTestPlan(requirements: string, projectType: string, complexity: number): TestPlan {
    const lower = requirements.toLowerCase();
    
    return {
      project_name: projectType,
      scope: `End-to-end testing of ${projectType.toLowerCase()} functionality`,
      objectives: [
        'Validate all functional requirements are met',
        'Ensure system reliability and performance',
        'Verify security and data integrity',
        'Confirm user experience meets expectations'
      ],
      qa_strategy: complexity >= 7 ? 'Hybrid (70% Automation, 30% Manual)' : 'Balanced (50% Automation, 50% Manual)',
      test_types: this.determineTestTypes(lower),
      tools: {
        automation: this.selectAutomationTools(lower, complexity),
        manual: ['TestRail', 'Jira', 'Confluence', 'Browser DevTools'],
        performance: complexity >= 6 ? ['JMeter', 'K6', 'Artillery'] : ['Lighthouse', 'WebPageTest'],
        security: complexity >= 7 ? ['OWASP ZAP', 'Burp Suite', 'SonarQube'] : ['OWASP ZAP', 'npm audit']
      },
      entry_criteria: [
        'Development feature complete',
        'Unit tests passing',
        'Test environment available',
        'Test data prepared',
        'Build deployed to test environment'
      ],
      exit_criteria: [
        'All critical and high priority test cases executed',
        'No P1/P2 defects open',
        'Automation test suite passing',
        'Performance benchmarks met',
        'Security scan completed with no critical issues'
      ],
      environments: ['Development', 'Staging', 'Pre-production', 'Production'],
      risks: this.identifyRisks(lower, complexity),
      timeline: {
        test_planning: complexity >= 7 ? '2-3 weeks' : '1-2 weeks',
        test_execution: complexity >= 7 ? '4-6 weeks' : '2-4 weeks',
        regression_testing: '1-2 weeks'
      }
    };
  }

  private static determineTestTypes(requirements: string): string[] {
    const types = ['Functional Testing', 'Integration Testing', 'Regression Testing'];
    
    if (requirements.includes('auth') || requirements.includes('security')) {
      types.push('Security Testing');
    }
    if (requirements.includes('performance') || requirements.includes('load') || requirements.includes('scale')) {
      types.push('Performance Testing');
    }
    if (requirements.includes('mobile') || requirements.includes('responsive')) {
      types.push('Cross-browser Testing', 'Mobile Testing');
    }
    if (requirements.includes('api') || requirements.includes('service')) {
      types.push('API Testing');
    }
    
    types.push('User Acceptance Testing', 'Smoke Testing');
    
    return types;
  }

  private static selectAutomationTools(requirements: string, complexity: number): string[] {
    const tools = [];
    
    if (requirements.includes('react') || requirements.includes('frontend') || requirements.includes('ui')) {
      tools.push(complexity >= 7 ? 'Playwright' : 'Cypress');
    }
    if (requirements.includes('api') || requirements.includes('backend')) {
      tools.push('Postman', 'Supertest');
    }
    if (requirements.includes('mobile')) {
      tools.push('Appium');
    }
    if (complexity >= 6) {
      tools.push('Jest', 'Testing Library');
    }
    
    return tools.length > 0 ? tools : ['Cypress', 'Jest'];
  }

  private static identifyRisks(requirements: string, complexity: number): any[] {
    const risks = [];
    
    if (requirements.includes('payment') || requirements.includes('billing')) {
      risks.push({
        risk: 'Payment gateway integration failures',
        mitigation: 'Use sandbox environment, implement retry mechanisms',
        probability: 'Medium',
        impact: 'High'
      });
    }
    
    if (requirements.includes('oauth') || requirements.includes('third-party')) {
      risks.push({
        risk: 'Third-party service dependencies',
        mitigation: 'Mock external services, implement fallback mechanisms',
        probability: 'Medium',
        impact: 'Medium'
      });
    }
    
    if (complexity >= 7) {
      risks.push({
        risk: 'Complex integration testing scenarios',
        mitigation: 'Incremental testing approach, comprehensive test data management',
        probability: 'High',
        impact: 'Medium'
      });
    }
    
    risks.push({
      risk: 'Test environment instability',
      mitigation: 'Automated environment provisioning, health checks',
      probability: 'Medium',
      impact: 'Medium'
    });
    
    return risks;
  }

  private static generateTestSuites(sentences: string[], projectType: string): TestSuite[] {
    const suites = new Map<string, TestCase[]>();
    
    sentences.forEach((sentence, index) => {
      const suiteName = this.categorizeSuite(sentence);
      const testCase = this.generateTestCase(sentence, index, suiteName);
      
      if (!suites.has(suiteName)) {
        suites.set(suiteName, []);
      }
      suites.get(suiteName)!.push(testCase);
    });

    return Array.from(suites.entries()).map(([name, testCases]) => ({
      name,
      description: `Test suite for ${name.toLowerCase()} functionality`,
      test_cases: testCases,
      automation_coverage: this.calculateAutomationCoverage(testCases)
    }));
  }

  private static categorizeSuite(sentence: string): string {
    const lower = sentence.toLowerCase();
    
    if (lower.includes('auth') || lower.includes('login') || lower.includes('signup')) {
      return 'Authentication & Authorization';
    }
    if (lower.includes('payment') || lower.includes('billing') || lower.includes('subscription')) {
      return 'Payment & Billing';
    }
    if (lower.includes('admin') || lower.includes('manage') || lower.includes('moderate')) {
      return 'Admin & Management';
    }
    if (lower.includes('create') || lower.includes('upload') || lower.includes('generate')) {
      return 'Content Creation';
    }
    if (lower.includes('search') || lower.includes('filter') || lower.includes('analytics')) {
      return 'Search & Analytics';
    }
    if (lower.includes('mobile') || lower.includes('responsive') || lower.includes('ui')) {
      return 'UI & Responsive Design';
    }
    if (lower.includes('api') || lower.includes('integration') || lower.includes('service')) {
      return 'API & Integration';
    }
    
    return 'Core Functionality';
  }

  private static generateTestCase(sentence: string, index: number, suiteName: string): TestCase {
    const lower = sentence.toLowerCase();
    const testId = `TC_${suiteName.replace(/[^A-Z]/g, '')}_${String(index + 1).padStart(3, '0')}`;
    
    return {
      id: testId,
      title: this.generateTestTitle(sentence),
      description: `Verify that ${sentence.toLowerCase()}`,
      pre_conditions: this.generatePreConditions(sentence),
      test_steps: this.generateTestSteps(sentence),
      expected_result: this.generateExpectedResult(sentence),
      priority: this.determinePriority(sentence),
      type: this.determineTestType(sentence),
      tags: this.generateTags(sentence, suiteName),
      automation_candidate: this.isAutomationCandidate(sentence),
      automation_tool: this.suggestAutomationTool(sentence),
      estimated_execution_time: this.estimateExecutionTime(sentence),
      linked_story: `Story for: ${this.generateTestTitle(sentence)}`
    };
  }

  private static generateTestTitle(sentence: string): string {
    const words = sentence.split(' ').slice(0, 8);
    return `Test ${words.join(' ').toLowerCase()}`;
  }

  private static generatePreConditions(sentence: string): string[] {
    const lower = sentence.toLowerCase();
    const conditions = ['Application is accessible', 'Test environment is available'];
    
    if (lower.includes('login') || lower.includes('auth')) {
      conditions.push('User account exists in the system');
    }
    if (lower.includes('admin')) {
      conditions.push('Admin user is logged in');
    }
    if (lower.includes('payment')) {
      conditions.push('Payment gateway is configured');
    }
    if (lower.includes('upload') || lower.includes('create')) {
      conditions.push('User has necessary permissions');
    }
    
    return conditions;
  }

  private static generateTestSteps(sentence: string): TestStep[] {
    const lower = sentence.toLowerCase();
    const steps: TestStep[] = [];
    
    if (lower.includes('signup') || lower.includes('register')) {
      steps.push(
        { step_number: 1, action: 'Navigate to signup page' },
        { step_number: 2, action: 'Enter valid user details' },
        { step_number: 3, action: 'Click signup/register button' },
        { step_number: 4, action: 'Verify confirmation message or redirect' }
      );
    } else if (lower.includes('login')) {
      steps.push(
        { step_number: 1, action: 'Navigate to login page' },
        { step_number: 2, action: 'Enter valid credentials' },
        { step_number: 3, action: 'Click login button' },
        { step_number: 4, action: 'Verify successful login and redirect' }
      );
    } else if (lower.includes('create') || lower.includes('upload')) {
      steps.push(
        { step_number: 1, action: 'Navigate to creation/upload page' },
        { step_number: 2, action: 'Fill in required information' },
        { step_number: 3, action: 'Submit the form' },
        { step_number: 4, action: 'Verify successful creation/upload' }
      );
    } else {
      steps.push(
        { step_number: 1, action: 'Perform the required action' },
        { step_number: 2, action: 'Verify the system response' },
        { step_number: 3, action: 'Check for expected behavior' }
      );
    }
    
    return steps;
  }

  private static generateExpectedResult(sentence: string): string {
    const lower = sentence.toLowerCase();
    
    if (lower.includes('signup') || lower.includes('register')) {
      return 'User account is created successfully and user is redirected to dashboard or confirmation page';
    }
    if (lower.includes('login')) {
      return 'User is authenticated and redirected to the main application dashboard';
    }
    if (lower.includes('create') || lower.includes('upload')) {
      return 'Content is created/uploaded successfully and visible to the user';
    }
    if (lower.includes('download')) {
      return 'File is downloaded successfully in the specified format';
    }
    
    return `The functionality described in "${sentence}" works as expected`;
  }

  private static determinePriority(sentence: string): 'High' | 'Medium' | 'Low' {
    const lower = sentence.toLowerCase();
    
    for (const keyword of this.PRIORITY_KEYWORDS.HIGH) {
      if (lower.includes(keyword)) return 'High';
    }
    for (const keyword of this.PRIORITY_KEYWORDS.MEDIUM) {
      if (lower.includes(keyword)) return 'Medium';
    }
    
    return 'Low';
  }

  private static determineTestType(sentence: string): any {
    const lower = sentence.toLowerCase();
    
    if (lower.includes('security') || lower.includes('auth') || lower.includes('permission')) {
      return 'Security';
    }
    if (lower.includes('performance') || lower.includes('load') || lower.includes('speed')) {
      return 'Performance';
    }
    if (lower.includes('api') || lower.includes('service') || lower.includes('integration')) {
      return 'Integration';
    }
    if (lower.includes('edge') || lower.includes('boundary') || lower.includes('limit')) {
      return 'Edge Case';
    }
    if (lower.includes('invalid') || lower.includes('error') || lower.includes('fail')) {
      return 'Negative';
    }
    
    return 'Functional';
  }

  private static generateTags(sentence: string, suiteName: string): string[] {
    const tags = ['regression'];
    const lower = sentence.toLowerCase();
    
    if (lower.includes('critical') || lower.includes('must') || lower.includes('auth')) {
      tags.push('smoke');
    }
    if (lower.includes('api')) {
      tags.push('api');
    }
    if (lower.includes('ui') || lower.includes('interface')) {
      tags.push('ui');
    }
    if (lower.includes('mobile') || lower.includes('responsive')) {
      tags.push('mobile');
    }
    
    tags.push(suiteName.toLowerCase().replace(/[^a-z]/g, ''));
    
    return tags;
  }

  private static isAutomationCandidate(sentence: string): boolean {
    const lower = sentence.toLowerCase();
    
    // Good automation candidates
    const automationFriendly = [
      'login', 'signup', 'api', 'create', 'update', 'delete', 
      'search', 'filter', 'validation', 'calculation'
    ];
    
    // Poor automation candidates
    const manualOnly = [
      'visual', 'design', 'usability', 'accessibility', 
      'exploratory', 'ad-hoc'
    ];
    
    if (manualOnly.some(keyword => lower.includes(keyword))) {
      return false;
    }
    
    return automationFriendly.some(keyword => lower.includes(keyword));
  }

  private static suggestAutomationTool(sentence: string): string | undefined {
    const lower = sentence.toLowerCase();
    
    if (lower.includes('api') || lower.includes('service')) {
      return 'Postman/Supertest';
    }
    if (lower.includes('ui') || lower.includes('interface') || lower.includes('click')) {
      return 'Cypress/Playwright';
    }
    if (lower.includes('performance') || lower.includes('load')) {
      return 'JMeter/K6';
    }
    
    return this.isAutomationCandidate(sentence) ? 'Cypress' : undefined;
  }

  private static estimateExecutionTime(sentence: string): string {
    const lower = sentence.toLowerCase();
    
    if (lower.includes('complex') || lower.includes('integration') || lower.includes('end-to-end')) {
      return '15-30 minutes';
    }
    if (lower.includes('simple') || lower.includes('basic') || lower.includes('validation')) {
      return '2-5 minutes';
    }
    
    return '5-15 minutes';
  }

  private static calculateAutomationCoverage(testCases: TestCase[]): number {
    const automationCandidates = testCases.filter(tc => tc.automation_candidate).length;
    return Math.round((automationCandidates / testCases.length) * 100);
  }

  private static generateAutomationRecommendations(projectType: string, complexity: number, testSuites: TestSuite[]): any {
    const totalTestCases = testSuites.reduce((sum, suite) => sum + suite.test_cases.length, 0);
    const automationCandidates = testSuites.reduce((sum, suite) => 
      sum + suite.test_cases.filter(tc => tc.automation_candidate).length, 0);
    
    return {
      framework: complexity >= 7 ? 'Playwright + Jest' : 'Cypress + Testing Library',
      reasoning: complexity >= 7 
        ? 'Playwright offers better cross-browser support and parallel execution for complex applications'
        : 'Cypress provides excellent developer experience and debugging capabilities for moderate complexity',
      coverage_target: Math.min(Math.round((automationCandidates / totalTestCases) * 100), 80),
      priority_areas: [
        'Authentication flows',
        'Core user journeys',
        'API endpoints',
        'Regression test suite'
      ]
    };
  }

  private static calculateMetrics(testSuites: TestSuite[]): any {
    const allTestCases = testSuites.flatMap(suite => suite.test_cases);
    const automationCandidates = allTestCases.filter(tc => tc.automation_candidate).length;
    
    const coverageByType = allTestCases.reduce((acc, tc) => {
      acc[tc.type] = (acc[tc.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const totalExecutionMinutes = allTestCases.reduce((sum, tc) => {
      const minutes = parseInt(tc.estimated_execution_time.split('-')[1] || '10');
      return sum + minutes;
    }, 0);
    
    return {
      total_test_cases: allTestCases.length,
      automation_candidates: automationCandidates,
      estimated_execution_time: `${Math.round(totalExecutionMinutes / 60)} hours`,
      coverage_by_type: coverageByType
    };
  }
}