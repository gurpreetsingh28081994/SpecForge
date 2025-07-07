export interface TestStep {
  step_number: number;
  action: string;
  expected_result?: string;
}

export interface TestCase {
  id: string;
  title: string;
  description: string;
  pre_conditions: string[];
  test_steps: TestStep[];
  expected_result: string;
  priority: 'High' | 'Medium' | 'Low';
  type: 'Functional' | 'Integration' | 'Regression' | 'Security' | 'Performance' | 'Edge Case' | 'Negative';
  tags: string[];
  automation_candidate: boolean;
  automation_tool?: string;
  estimated_execution_time: string;
  linked_story?: string;
}

export interface TestSuite {
  name: string;
  description: string;
  test_cases: TestCase[];
  automation_coverage: number;
}

export interface TestPlan {
  project_name: string;
  scope: string;
  objectives: string[];
  qa_strategy: string;
  test_types: string[];
  tools: {
    automation: string[];
    manual: string[];
    performance: string[];
    security: string[];
  };
  entry_criteria: string[];
  exit_criteria: string[];
  environments: string[];
  risks: {
    risk: string;
    mitigation: string;
    probability: 'High' | 'Medium' | 'Low';
    impact: 'High' | 'Medium' | 'Low';
  }[];
  timeline: {
    test_planning: string;
    test_execution: string;
    regression_testing: string;
  };
}

export interface TestingOutput {
  test_plan: TestPlan;
  test_suites: TestSuite[];
  automation_recommendations: {
    framework: string;
    reasoning: string;
    coverage_target: number;
    priority_areas: string[];
  };
  metrics: {
    total_test_cases: number;
    automation_candidates: number;
    estimated_execution_time: string;
    coverage_by_type: Record<string, number>;
  };
  metadata: {
    generated_at: string;
    requirements_analyzed: number;
    complexity_score: number;
  };
}