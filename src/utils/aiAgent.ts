// AI Agent utility for calling the custom endpoint

const AI_AGENT_URL = import.meta.env.VITE_AI_AGENT_URL as string;

import { JiraOutput, JiraEpic, JiraStory } from '../types/jira';
import { ArchitectureOutput } from '../types/architecture';
import { TestingOutput, TestCase } from '../types/testing';
import { TestingAnalyzer } from './testingAnalyzer';

export type AnalysisMode = 'jira' | 'architecture' | 'testing';

interface AgentRequest {
  user_query: string;
  agent_role: string;
  analysis_mode: AnalysisMode;
}

export async function analyzeWithAIAgent(requirements: string, mode: AnalysisMode): Promise<any> {
  if (!AI_AGENT_URL) {
    throw new Error('AI Agent endpoint URL is not configured.');
  }

  // Customize the user_query and agent_role as needed for each mode
  let user_query = '';
  let agent_role = '';

  switch (mode) {
    case 'jira':
      user_query = `Transform these requirements into JIRA epics and user stories with acceptance criteria.\n\n${requirements}`;
      agent_role = `You are a senior software engineer and JIRA expert.\n\nReturn a clear, structured markdown list of JIRA epics and user stories with acceptance criteria.\n\nFormat:\n\n**Epic 1: Epic Title**\n- **User Story 1.1: Story Title**\n  - **Description**: ...\n  - **Acceptance Criteria**:\n    - ...\n    - ...\n\nContinue for all epics and stories. Do not include explanations or extra text before or after the list.`;
      break;
    case 'architecture':
      user_query = `Analyze these requirements and generate a system architecture, tech stack recommendations, and deployment strategy.\n\n${requirements}`;
      agent_role = `You are a senior software architect.\n\nReturn a clear, structured markdown document with the following sections:\n\n## Project Overview\n- Project Type: ...\n- Complexity Score (out of 10): ...\n- Estimated Team Size: ...\n- Estimated Timeline: ...\n\n## Scalability Requirements\n...markdown bullets...\n\n## System Components\nReturn a markdown table with the following columns for each component:\n| Name | Type | Description | Technologies | Icon |\n|------|------|-------------|--------------|------|\n| Frontend Application | frontend | User interface and client-side logic | React, TypeScript, Tailwind CSS | globe |\n| Backend API | backend | Core business logic and API endpoints | Node.js, Express, TypeScript | server |\n| Primary Database | database | Main data storage | PostgreSQL | database |\n| Payment Gateway | external | Payment processing | Stripe, Razorpay | globe |\n| Notification Service | service | Email and push notifications | SendGrid, Firebase Cloud Messaging | layers |\n| Analytics Service | service | User analytics and tracking | PostHog, Google Analytics | layers |\n\n## High-Level Architecture Diagram\n\n### Mermaid.js\n\n\`\`\`mermaid\n...mermaid diagram...\n\`\`\`\n\n### PlantUML\n\n\`\`\`plantuml\n...plantuml diagram...\n\`\`\`\n\n## Low-Level Architecture Diagram\n\n### Mermaid.js\n\n\`\`\`mermaid\n...mermaid diagram...\n\`\`\`\n\n### PlantUML\n\n\`\`\`plantuml\n...plantuml diagram...\n\`\`\`\n\n## Tech Stack Recommendations\n- Frontend: ...\n- Backend: ...\n- Database: ...\n- Other: ...\n\n## Deployment Strategy\n- ...\n\nDo not include explanations or extra text before or after the sections.`;
      break;
    case 'testing':
      user_query = `Generate a comprehensive QA test plan, test cases, and automation strategy for these requirements.\n\n${requirements}`;
      agent_role = `You are a senior QA engineer.\n\nReturn a clear, structured markdown document with the following sections:\n\n## Test Plan\n...markdown bullets...\n\n## Test Suites and Test Cases\n### Suite: <suite name>\n- **Test Case 1:** <title>\n  - **Description:** ...\n  - **Steps:** ...\n  - **Expected Result:** ...\n  - **Priority:** ...\n\n## Automation Recommendations\n- ...\n\n## QA Metrics\n- ...\n\nDo not include explanations or extra text before or after the sections.`;
      break;
    default:
      throw new Error('Unknown analysis mode');
  }

  const payload = {
    user_query,
    agent_role
  };

  const response = await fetch(AI_AGENT_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error('AI Agent request failed');
  }

  const data = await response.json();
  return data.response;
}

// Hybrid parser for JIRA responses
export function transformJiraResponseHybrid(aiResponse: any): JiraOutput {
  let jsonString: string | null = null;
  let parsed: any = null;

  // If the response is an object with a string 'response' key, use that
  if (aiResponse && typeof aiResponse === 'object' && typeof aiResponse.response === 'string') {
    jsonString = aiResponse.response.trim();
  } else if (typeof aiResponse === 'string') {
    jsonString = aiResponse.trim();
  }

  // If the string starts with triple backticks, strip them and the language tag
  if (jsonString && jsonString.startsWith('```')) {
    jsonString = jsonString.replace(/^```[a-zA-Z]*\n?/, '').replace(/```$/, '').trim();
  }

  // Try to parse as JSON
  if (jsonString) {
    try {
      parsed = JSON.parse(jsonString);
      // If parsed is a string (stringified JSON), parse again
      if (typeof parsed === 'string') {
        parsed = JSON.parse(parsed);
      }
    } catch (err) {
      parsed = null;
    }
  }

  if (parsed && Array.isArray(parsed.epics)) {
    const epics: JiraEpic[] = parsed.epics.map((epic: any) => ({
      title: epic.title || '',
      description: epic.description || '',
      features: Array.isArray(epic.features) ? epic.features : [],
      stories: (epic.stories || []).map((story: any): JiraStory => ({
        title: story.title || '',
        description: story.description || '',
        acceptance_criteria: Array.isArray(story.acceptance_criteria) ? story.acceptance_criteria : [],
        type: (story.type === 'Feature' || story.type === 'Bug' || story.type === 'Chore') ? story.type : 'Feature',
        priority: (story.priority === 'High' || story.priority === 'Medium' || story.priority === 'Low') ? story.priority : 'Medium',
        story_points: typeof story.story_points === 'number' ? story.story_points : 1,
      })),
    }));
    const total_stories = epics.reduce((sum: number, e: JiraEpic) => sum + e.stories.length, 0);
    const estimated_total_points = epics.reduce(
      (sum: number, e: JiraEpic) => sum + e.stories.reduce((s: number, st: JiraStory) => s + (st.story_points || 0), 0),
      0
    );
    const result = {
      epics,
      metadata: {
        total_epics: epics.length,
        total_stories,
        estimated_total_points,
        generated_at: new Date().toISOString(),
      },
    };
    return result;
  }

  // 2. Fallback: robust parser for markdown-like output (new AI format)
  const text = String(aiResponse);
  // More robust regex: allows for any whitespace after the closing **
  const epicRegex = /\*\*Epic\s+(\d+):\s+(.*?)\*\*\s*([\s\S]*?)(?=(?:\*\*Epic\s+\d+:)|$)/g;
  const epics: JiraEpic[] = [];
  let epicDebugMatches = [];
  let epicMatch: RegExpExecArray | null;
  while ((epicMatch = epicRegex.exec(text)) !== null) {
    epicDebugMatches.push(epicMatch);
    const epicTitle = epicMatch[2].trim();
    // Use the captured group for the block
    const epicBlock = epicMatch[3] || '';

    const storyRegex = /-\s*\*\*User Story ([\d.]+): (.*?)\*\*[\s\S]*?(?=(-\s*\*\*User Story [\d.]+:)|$)/g;
    const stories: JiraStory[] = [];
    let storyMatch;
    while ((storyMatch = storyRegex.exec(epicBlock)) !== null) {
      const storyTitle = storyMatch[2].trim();
      const storyBlock = epicBlock.slice(storyMatch.index, storyRegex.lastIndex);

      const descMatch = storyBlock.match(/-\s*\*\*Description\*\*:\s*(.*)/);
      const description = descMatch ? descMatch[1].trim() : '';

      const acBlockMatch = storyBlock.match(/-\s*\*\*Acceptance Criteria\*\*:\s*([\s\S]*?)(?=(\n\s*-\s*\*\*|$))/);
      let acceptance_criteria: string[] = [];
      if (acBlockMatch) {
        acceptance_criteria = acBlockMatch[1]
          .split('\n')
          .map(line => line.trim())
          .filter(line => line.startsWith('-'))
          .map(line => line.replace(/^- /, '').trim());
      }

      stories.push({
        title: storyTitle,
        description: description ? description : `As a user, I want to ${storyTitle.toLowerCase()}.`,
        acceptance_criteria,
        type: 'Feature',
        priority: 'Medium',
        story_points: 3,
      });
    }

    epics.push({
      title: epicTitle,
      description: `Enable ${epicTitle.toLowerCase()} functionality.`,
      features: [`${epicTitle.split(' ')[0]} functionality`],
      stories,
    });
  }
  console.log('[JIRA PARSER] Epic regex matches:', epicDebugMatches);
  const total_epics = epics.length;
  const total_stories = epics.reduce((sum: number, e: JiraEpic) => sum + e.stories.length, 0);
  const estimated_total_points = epics.reduce(
    (sum: number, e: JiraEpic) => sum + e.stories.reduce((s: number, st: JiraStory) => s + (st.story_points || 0), 0),
    0
  );
  const result = {
    epics,
    metadata: {
      total_epics,
      total_stories,
      estimated_total_points,
      generated_at: new Date().toISOString(),
    },
  };
  return result;
}

export function transformArchitectureResponseHybrid(aiResponse: any): ArchitectureOutput {
  console.log('[ARCHITECTURE PARSER] Raw aiResponse:', aiResponse);

  let jsonString: string | null = null;
  let parsed: any = null;

  // If the response is an object with a string 'response' key, use that
  if (aiResponse && typeof aiResponse === 'object' && typeof aiResponse.response === 'string') {
    jsonString = aiResponse.response.trim();
  } else if (typeof aiResponse === 'string') {
    jsonString = aiResponse.trim();
  }

  // If the string starts with triple backticks, strip them and the language tag
  if (jsonString && jsonString.startsWith('```')) {
    jsonString = jsonString.replace(/^```[a-zA-Z]*\n?/, '').replace(/```$/, '').trim();
    console.log('[ARCHITECTURE PARSER] Stripped code block. Cleaned jsonString:', jsonString);
  }

  // Try to parse as JSON
  if (jsonString) {
    try {
      parsed = JSON.parse(jsonString);
      console.log('[ARCHITECTURE PARSER] Parsed JSON:', parsed);
      // If parsed is a string (stringified JSON), parse again
      if (typeof parsed === 'string') {
        parsed = JSON.parse(parsed);
        console.log('[ARCHITECTURE PARSER] Second parse result:', parsed);
      }
    } catch (err) {
      console.error('[ARCHITECTURE PARSER] Error parsing JSON:', err);
      parsed = null;
    }
  }

  if (parsed && parsed.projectType !== undefined && parsed.highLevelDiagram !== undefined) {
    console.log('[ARCHITECTURE PARSER] Parsed object is ArchitectureOutput:', parsed);
    return parsed as ArchitectureOutput;
  }

  // Fallback: parse markdown
  console.log('[ARCHITECTURE PARSER] Attempting markdown parser on:', jsonString);
  return parseArchitectureMarkdown(jsonString || '');
}

function safeString(val: any): string {
  if (typeof val === 'string') return val;
  if (val == null) return '';
  return String(val);
}

function parseArchitectureMarkdown(markdown: string): ArchitectureOutput {
  console.log('[ARCHITECTURE MARKDOWN PARSER] Raw markdown:', markdown);
  // Project Overview
  const overviewMatch = markdown.match(/## Project Overview[\s\S]*?(?=##|$)/);
  let projectType = '', complexityScore = 0, estimatedTeamSize = '', estimatedTimeline = '';
  if (overviewMatch) {
    const typeMatch = overviewMatch[0].match(/Project Type:\s*(.*)/);
    const scoreMatch = overviewMatch[0].match(/Complexity Score \(out of 10\):\s*(\d+)/);
    const teamMatch = overviewMatch[0].match(/Estimated Team Size:\s*(.*)/);
    const timelineMatch = overviewMatch[0].match(/Estimated Timeline:\s*(.*)/);
    projectType = typeMatch ? typeMatch[1].trim() : '';
    complexityScore = scoreMatch ? parseInt(scoreMatch[1], 10) : 0;
    estimatedTeamSize = teamMatch ? teamMatch[1].trim() : '';
    estimatedTimeline = timelineMatch ? timelineMatch[1].trim() : '';
  }

  // Scalability Requirements
  const scalabilityMatch = markdown.match(/## Scalability Requirements[\s\S]*?(?=##|$)/);
  let scalabilityRequirements = '';
  if (scalabilityMatch) {
    scalabilityRequirements = scalabilityMatch[0].replace(/## Scalability Requirements/, '').trim();
  }

  // System Components
  let systemComponents: any[] = [];
  const tableMatch = markdown.match(/## System Components[\s\S]*?\|[\s\S]*?\|\s*\n([\s\S]*?)(?=\n##|$)/);
  if (tableMatch) {
    // Extract table rows
    const rows = tableMatch[1].split('\n').map(r => r.trim()).filter(r => r && !r.startsWith('|---'));
    systemComponents = rows.map((row, idx) => {
      const cols = row.split('|').map(c => c.trim());
      return {
        id: `comp_${idx}`,
        name: safeString(cols[1] || ''),
        type: safeString(cols[2] || 'service'),
        description: safeString(cols[3] || ''),
        technologies: cols[4] ? safeString(cols[4]).split(',').map((t: string) => t.trim()).filter(Boolean) : [],
        icon: safeString(cols[5] || ''),
        connections: []
      };
    });
  } else {
    // Fallback: old bullet list logic
    const componentsMatch = markdown.match(/## System Components[\s\S]*?(?=##|$)/);
    if (componentsMatch) {
      systemComponents = componentsMatch[0].split('\n').filter(l => l.trim().startsWith('-')).map((l, idx) => ({
        id: `comp_${idx}`,
        name: safeString(l.replace(/^- /, '').trim()),
        type: 'service',
        description: '',
        technologies: [],
        icon: '',
        connections: []
      }));
    }
  }

  // Extract high-level diagrams
  const highLevelMermaidMatch = markdown.match(/## High-Level Architecture Diagram[\s\S]*?### Mermaid\.js[\s\S]*?```mermaid\n([\s\S]*?)```/);
  const highLevelPlantUmlMatch = markdown.match(/## High-Level Architecture Diagram[\s\S]*?### PlantUML[\s\S]*?```plantuml\n([\s\S]*?)```/);
  // Extract low-level diagrams
  const lowLevelMermaidMatch = markdown.match(/## Low-Level Architecture Diagram[\s\S]*?### Mermaid\.js[\s\S]*?```mermaid\n([\s\S]*?)```/);
  const lowLevelPlantUmlMatch = markdown.match(/## Low-Level Architecture Diagram[\s\S]*?### PlantUML[\s\S]*?```plantuml\n([\s\S]*?)```/);

  const techStackMatch = markdown.match(/## Tech Stack Recommendations[\s\S]*?(?=##|$)/);
  const deploymentMatch = markdown.match(/## Deployment Strategy[\s\S]*?(?=##|$)/);

  // Tech stack parsing (simple bullet list)
  let techStack: any[] = [];
  if (techStackMatch) {
    const lines = techStackMatch[0].split('\n').filter(l => l.trim().startsWith('-'));
    techStack = lines.map(line => {
      const [category, rest] = line.replace(/^- /, '').split(':');
      return {
        category: category ? category.trim() : '',
        primary: rest ? rest.trim() : '',
        alternatives: [],
        reasoning: ''
      };
    });
  }

  // Deployment parsing (simple bullet list)
  let deploymentStrategy = {
    type: '',
    description: '',
    components: [] as string[]
  };
  if (deploymentMatch) {
    const lines = deploymentMatch[0].split('\n').filter(l => l.trim().startsWith('-'));
    deploymentStrategy.components = lines.map(line => line.replace(/^- /, '').trim());
    deploymentStrategy.type = deploymentStrategy.components[0] || '';
    deploymentStrategy.description = deploymentStrategy.components.join(', ');
  }

  return {
    projectType,
    scalabilityRequirements,
    highLevelDiagram: {
      type: 'high-level',
      title: 'High-Level Architecture',
      description: '',
      components: systemComponents, // Use parsed objects directly
      mermaidCode: highLevelMermaidMatch ? highLevelMermaidMatch[1].trim() : '',
      plantUmlCode: highLevelPlantUmlMatch ? highLevelPlantUmlMatch[1].trim() : ''
    },
    lowLevelDiagram: {
      type: 'low-level',
      title: 'Low-Level Architecture',
      description: '',
      components: [],
      mermaidCode: lowLevelMermaidMatch ? lowLevelMermaidMatch[1].trim() : '',
      plantUmlCode: lowLevelPlantUmlMatch ? lowLevelPlantUmlMatch[1].trim() : ''
    },
    techStack,
    deploymentStrategy,
    metadata: {
      generated_at: new Date().toISOString(),
      complexity_score: complexityScore,
      estimated_team_size: estimatedTeamSize,
      estimated_timeline: estimatedTimeline
    }
  };
}

function parseEnhancedTestingMarkdown(markdown: string): TestingOutput {
  // --- 1. Extract Sections (robust header matching) ---
  const testPlanSection = markdown.match(/##\s*(Test\s*Plan|QA\s*Plan|Testing\s*Plan)[\s\S]*?(?=^##|\Z)/gim)?.[0] || '';
  // Robust extraction: find suites header, then next ## header or end of string
  const suitesHeaderRegex = /##\s*(Test\s*Suites?\s*(and)?\s*Test\s*Cases?|Suites?|Test\s*Cases)/i;
  const suitesHeaderMatch = suitesHeaderRegex.exec(markdown);
  let suitesSection = '';
  if (suitesHeaderMatch) {
    const startIdx = suitesHeaderMatch.index;
    // Find the next ## header after this one
    const nextHeaderRegex = /(^|\n)##\s+/g;
    nextHeaderRegex.lastIndex = startIdx + 1;
    const nextHeaderMatch = nextHeaderRegex.exec(markdown);
    const endIdx = nextHeaderMatch ? nextHeaderMatch.index : markdown.length;
    suitesSection = markdown.substring(startIdx, endIdx).trim();
  }
  const automationSection = markdown.match(/##\s*(Automation\s*Recommendations?|Automation)[\s\S]*?(?=^##|\Z)/gim)?.[0] || '';
  const metricsSection = markdown.match(/##\s*(QA\s*Metrics|Metrics|Testing\s*Metrics)[\s\S]*?(?=^##|\Z)/gim)?.[0] || '';
  const risksSection = markdown.match(/##\s*(Risks?|Risk\s*Analysis|Risk\s*Mitigation)[\s\S]*?(?=^##|\Z)/gim)?.[0] || '';

  console.log('[TESTING PARSER] testPlanSection:', testPlanSection);
  console.log('[TESTING PARSER] suitesSection:', suitesSection);
  console.log('[TESTING PARSER] automationSection:', automationSection);
  console.log('[TESTING PARSER] metricsSection:', metricsSection);
  console.log('[TESTING PARSER] risksSection:', risksSection);

  // --- 2. Parse Test Suites and Cases (improved regex + debug) ---
  const suiteBlocks = suitesSection.split(/###\s*Suite:?\s*/gi).slice(1);
  console.log('[TESTING PARSER] suiteBlocks:', suiteBlocks);
  const test_suites = suiteBlocks.map((block, suiteIdx) => {
    const [suiteNameLine, ...rest] = block.split('\n');
    const suiteName = suiteNameLine.trim();
    const suiteContent = rest.join('\n');
    const caseBlocks = suiteContent.split(/^[\s\-*\d.]*\*\*Test Case\s*\d+\s*:?-?\*\*?\s*/gim).slice(1);
    console.log(`[TESTING PARSER] caseBlocks for suite "${suiteName}":`, caseBlocks);
    const test_cases = caseBlocks.map((caseBlock, caseIdx) => {
      const titleMatch = caseBlock.match(/^(.*?)(\n|$)/);
      const title = titleMatch ? titleMatch[1].replace(/\*\*/g, '').replace(/:/g, '').trim() : `Test Case ${caseIdx+1}`;
      const descMatch = caseBlock.match(/-?\s*\*\*Description:?\*\*?\s*:?-?\s*(.*?)(\n|$)/);
      const description = descMatch ? descMatch[1].trim() : '';
      const stepsMatch = caseBlock.match(/-?\s*\*\*Steps:?\*\*?\s*:?-?\s*(.*?)(-?\s*\*\*Expected|$)/s);
      let steps: string[] = [];
      if (stepsMatch) {
        steps = stepsMatch[1].split(/,|\n/).map(s => s.replace(/^[\s\-\d.]+/, '').replace(/\"/g, '"').trim()).filter(Boolean);
      }
      const test_steps = steps.map((action, i) => ({ step_number: i + 1, action }));
      const expectedMatch = caseBlock.match(/-?\s*\*\*Expected Result:?\*\*?\s*:?-?\s*(.*?)(\n|$)/);
      const expected_result = expectedMatch ? expectedMatch[1].trim() : '';
      const priorityMatch = caseBlock.match(/-?\s*\*\*Priority:?\*\*?\s*:?-?\s*(.*?)(\n|$)/);
      const priority = priorityMatch ? (priorityMatch[1].trim() as 'High' | 'Medium' | 'Low') : 'Medium';
      let type: TestCase['type'] = 'Functional';
      const lower = (description + ' ' + steps.join(' ')).toLowerCase();
      if (lower.includes('security')) type = 'Security';
      else if (lower.includes('performance')) type = 'Performance';
      else if (lower.includes('integration')) type = 'Integration';
      else if (lower.includes('regression')) type = 'Regression';
      else if (lower.includes('edge')) type = 'Edge Case';
      else if (lower.includes('negative') || lower.includes('fail')) type = 'Negative';
      const tags = [
        ...(description.match(/#\w+/g) || []),
        ...steps.flatMap(s => s.match(/#\w+/g) || [])
      ].map(t => t.replace('#', ''));
      const automation_candidate = /automate|automation/i.test(description + ' ' + steps.join(' '));
      const linked_story_match = description.match(/Story: (.*?)(\n|$)/);
      const linked_story = linked_story_match ? linked_story_match[1].trim() : undefined;
      const preCondMatch = description.match(/Pre-conditions?: (.*?)(\n|$)/i);
      const pre_conditions = preCondMatch ? preCondMatch[1].split(/,|\n/).map(s => s.trim()).filter(Boolean) : [];
      const timeMatch = description.match(/Time: (.*?)(\n|$)/i);
      const estimated_execution_time = timeMatch ? timeMatch[1].trim() : '5-15 minutes';
      // Debug log for unparsed lines
      const knownFields = [title, description, ...steps, expected_result, priority];
      const unparsedLines = caseBlock.split('\n').filter(line => !knownFields.some(f => line.includes(f)) && line.trim());
      if (unparsedLines.length > 0) {
        console.log(`[TESTING PARSER] Unparsed lines in test case '${title}':`, unparsedLines);
      }
      return {
        id: `TC_${suiteIdx+1}_${caseIdx+1}`,
        title,
        description,
        pre_conditions,
        test_steps,
        expected_result,
        priority,
        type,
        tags,
        automation_candidate,
        estimated_execution_time,
        linked_story
      };
    });
    const automation_coverage = test_cases.length > 0 ? Math.round(100 * test_cases.filter(tc => tc.automation_candidate).length / test_cases.length) : 0;
    return {
      name: suiteName,
      description: `Test suite for ${suiteName.toLowerCase()} functionality`,
      test_cases,
      automation_coverage
    };
  });

  // --- 2b. Parse Risks Section (bullets or table) ---
  let risks: any[] = [];
  if (risksSection) {
    // Try to parse as bullet list first
    const riskLines = risksSection.split('\n').map(l => l.trim()).filter(l => l.startsWith('-') || l.startsWith('|'));
    // Table format
    if (riskLines.length > 0 && riskLines[0].startsWith('|')) {
      // Parse markdown table
      const rows = riskLines.filter(l => l.startsWith('|') && !l.includes('---'));
      for (let i = 1; i < rows.length; i++) {
        const cols = rows[i].split('|').map(c => c.trim());
        if (cols.length >= 5) {
          risks.push({
            risk: cols[1],
            mitigation: cols[2],
            probability: cols[3] as 'High' | 'Medium' | 'Low',
            impact: cols[4] as 'High' | 'Medium' | 'Low',
          });
        }
      }
    } else {
      // Bullet format: - Risk: ..., Mitigation: ..., Probability: ..., Impact: ...
      riskLines.forEach(line => {
        const match = line.match(/Risk:?\s*(.*?),\s*Mitigation:?\s*(.*?),\s*Probability:?\s*(High|Medium|Low),\s*Impact:?\s*(High|Medium|Low)/i);
        if (match) {
          risks.push({
            risk: match[1].trim(),
            mitigation: match[2].trim(),
            probability: match[3] as 'High' | 'Medium' | 'Low',
            impact: match[4] as 'High' | 'Medium' | 'Low',
          });
        }
      });
    }
    // Debug log for unparsed risk lines
    const parsedRisks = risks.map(r => r.risk);
    const unparsedRiskLines = riskLines.filter(line => !parsedRisks.some(risk => line.includes(risk)));
    if (unparsedRiskLines.length > 0) {
      console.log('[TESTING PARSER] Unparsed risk lines:', unparsedRiskLines);
    }
  }

  // --- 3. Parse Test Plan Section ---
  let project_name = '';
  let scope = '';
  let objectives: string[] = [];
  let qa_strategy = '';
  let test_types: string[] = [];
  let tools: { automation: string[]; manual: string[]; performance: string[]; security: string[] } = { automation: [], manual: [], performance: [], security: [] };
  let entry_criteria: string[] = [];
  let exit_criteria: string[] = [];
  let environments: string[] = [];
  let timeline = { test_planning: '', test_execution: '', regression_testing: '' };

  // Project name/type: try to extract from first bullet or line
  const planLines = testPlanSection.split('\n').map(l => l.trim()).filter(Boolean);
  if (planLines.length > 0) {
    const first = planLines[0];
    const match = first.match(/(Validate|Test|Ensure|Assess|Check|Perform|Conduct) (.+?)( via| using| for| and|\.|$)/i);
    if (match) {
      project_name = match[2].replace(/functionality|features|process|integration|testing|capabilities|support|options|analytics|performance|security|user|admin|art|download|payment|suite|test|plan/gi, '').trim();
      if (!project_name) project_name = 'Web Application';
    } else {
      project_name = first.replace(/^- /, '').replace(/\.$/, '').trim();
    }
  }
  // Scope: join all plan lines
  scope = planLines.join(' ');
  // Objectives: each bullet
  objectives = planLines.map(l => l.replace(/^- /, '').trim()).filter(Boolean);
  // QA strategy: look for 'strategy' or infer
  const strategyLine = planLines.find(l => /strategy|automation|manual/i.test(l));
  qa_strategy = strategyLine ? strategyLine.replace(/^- /, '').trim() : (test_suites.length > 5 ? 'Hybrid (70% Automation, 30% Manual)' : 'Balanced (50% Automation, 50% Manual)');
  // Test types: infer from objectives and test cases
  const typeSet = new Set<string>();
  objectives.forEach(obj => {
    if (/security/i.test(obj)) typeSet.add('Security Testing');
    if (/performance|load|stress/i.test(obj)) typeSet.add('Performance Testing');
    if (/integration/i.test(obj)) typeSet.add('Integration Testing');
    if (/regression/i.test(obj)) typeSet.add('Regression Testing');
    if (/mobile|responsive/i.test(obj)) typeSet.add('Mobile Testing');
    if (/api/i.test(obj)) typeSet.add('API Testing');
    if (/user acceptance/i.test(obj)) typeSet.add('User Acceptance Testing');
    if (/smoke/i.test(obj)) typeSet.add('Smoke Testing');
    if (/functional/i.test(obj)) typeSet.add('Functional Testing');
  });
  test_suites.forEach(suite => suite.test_cases.forEach(tc => typeSet.add(tc.type + ' Testing')));
  test_types = Array.from(typeSet);
  // Tools: infer from test types
  if (test_types.some(t => t.includes('API'))) tools.automation.push('Postman');
  if (test_types.some(t => t.includes('Functional'))) tools.automation.push('Cypress');
  if (test_types.some(t => t.includes('Performance'))) tools.performance.push('JMeter');
  if (test_types.some(t => t.includes('Security'))) tools.security.push('OWASP ZAP');
  tools.manual.push('TestRail', 'Jira');
  // Entry/Exit criteria, environments, risks, timeline: leave empty or infer if possible
  // --- Add defaults if missing ---
  if (!entry_criteria || entry_criteria.length === 0) {
    entry_criteria = [
      'Development feature complete',
      'Unit tests passing',
      'Test environment available',
      'Test data prepared',
      'Build deployed to test environment'
    ];
  }
  if (!exit_criteria || exit_criteria.length === 0) {
    exit_criteria = [
      'All critical and high priority test cases executed',
      'No P1/P2 defects open',
      'Automation test suite passing',
      'Performance benchmarks met',
      'Security scan completed with no critical issues'
    ];
  }
  if (!environments || environments.length === 0) {
    environments = ['Development', 'Staging', 'Pre-production', 'Production'];
  }
  if (!risks || risks.length === 0) {
    risks = [
      {
        risk: 'Third-party service dependencies',
        mitigation: 'Mock external services, implement fallback mechanisms',
        probability: 'Medium',
        impact: 'Medium'
      },
      {
        risk: 'Security vulnerabilities in authentication',
        mitigation: 'Conduct regular security audits, use strong encryption',
        probability: 'Low',
        impact: 'High'
      }
    ];
  }
  if (!timeline || !timeline.test_planning) {
    timeline = {
      test_planning: test_suites.length > 5 ? '2-3 weeks' : '1-2 weeks',
      test_execution: test_suites.length > 5 ? '4-6 weeks' : '2-4 weeks',
      regression_testing: '1-2 weeks'
    };
  }

  // --- 4. Parse Automation Recommendations ---
  let framework = '';
  let reasoning = '';
  let coverage_target = 0;
  let priority_areas: string[] = [];
  const autoLines = automationSection.split('\n').map(l => l.replace(/^- /, '').trim()).filter(Boolean);
  if (autoLines.length > 0) {
    priority_areas = autoLines;
    // Guess framework and reasoning
    if (autoLines.some(l => /cypress|playwright|selenium/i.test(l))) {
      framework = autoLines.find(l => /cypress|playwright|selenium/i.test(l)) || '';
      reasoning = 'Recommended based on automation suggestions.';
    } else {
      framework = test_suites.length > 5 ? 'Playwright + Jest' : 'Cypress + Testing Library';
      reasoning = 'Inferred from project size.';
    }
    // Guess coverage target
    coverage_target = Math.min(80, Math.round(100 * test_suites.reduce((sum, s) => sum + s.test_cases.filter(tc => tc.automation_candidate).length, 0) / (test_suites.reduce((sum, s) => sum + s.test_cases.length, 0) || 1)));
  }

  // --- 5. Parse QA Metrics ---
  let estimated_execution_time = '';
  let coverage_by_type: Record<string, number> = {};
  let total_test_cases = test_suites.reduce((sum, s) => sum + s.test_cases.length, 0);
  let automation_candidates = test_suites.reduce((sum, s) => sum + s.test_cases.filter(tc => tc.automation_candidate).length, 0);
  const metricLines = metricsSection.split('\n').map(l => l.replace(/^- /, '').trim()).filter(Boolean);
  metricLines.forEach((line: string) => {
    if (/execution time|time taken/i.test(line)) {
      estimated_execution_time = line.replace(/.*?: /, '');
    }
    if (/coverage/i.test(line)) {
      const match = line.match(/(\d+)%/);
      if (match) coverage_by_type['Functional'] = parseInt(match[1], 10);
    }
  });
  // Calculate coverage by type from test cases
  test_suites.forEach(suite => suite.test_cases.forEach(tc => {
    coverage_by_type[tc.type] = (coverage_by_type[tc.type] || 0) + 1;
  }));
  if (!estimated_execution_time) {
    // Estimate from test cases
    const totalMinutes = test_suites.flatMap(s => s.test_cases).reduce((sum, tc) => {
      const match = tc.estimated_execution_time.match(/(\d+)-?(\d+)?/);
      if (match) {
        const min = parseInt(match[1], 10);
        const max = match[2] ? parseInt(match[2], 10) : min;
        return sum + Math.round((min + max) / 2);
      }
      return sum + 10;
    }, 0);
    estimated_execution_time = `${Math.round(totalMinutes / 60)} hours`;
  }

  // --- 6. Compose Output ---
  if (test_suites.length === 0) {
    console.warn('[TESTING PARSER] No test suites parsed. suitesSection:', suitesSection);
    console.warn('[TESTING PARSER] suiteBlocks:', suiteBlocks);
  }
  if (Object.keys(coverage_by_type).length === 0) {
    const allTypes = test_suites.flatMap(suite => suite.test_cases.map(tc => tc.type));
    console.warn('[TESTING PARSER] coverage_by_type is empty. All test case types found:', allTypes);
  }
  console.log('[TESTING PARSER] Final test_suites:', test_suites);
  console.log('[TESTING PARSER] Final metrics.coverage_by_type:', coverage_by_type);
  return {
    test_plan: {
      project_name,
      scope,
      objectives,
      qa_strategy,
      test_types,
      tools,
      entry_criteria,
      exit_criteria,
      environments,
      risks,
      timeline
    },
    test_suites,
    automation_recommendations: {
      framework,
      reasoning,
      coverage_target,
      priority_areas
    },
    metrics: {
      total_test_cases,
      automation_candidates,
      estimated_execution_time,
      coverage_by_type
    },
    metadata: {
      generated_at: new Date().toISOString(),
      requirements_analyzed: objectives.length,
      complexity_score: test_types.length
    }
  };
}

export function transformTestingResponseHybrid(aiResponse: any): TestingOutput {
  console.log('[TESTING PARSER] Raw aiResponse:', aiResponse);

  let jsonString: string | null = null;
  let parsed: any = null;

  // If the response is an object with a string 'response' key, use that
  if (aiResponse && typeof aiResponse === 'object' && typeof aiResponse.response === 'string') {
    jsonString = aiResponse.response.trim();
  } else if (typeof aiResponse === 'string') {
    jsonString = aiResponse.trim();
  }

  // If the string starts with triple backticks, strip them and the language tag
  if (jsonString && jsonString.startsWith('```')) {
    jsonString = jsonString.replace(/^```[a-zA-Z]*\n?/, '').replace(/```$/, '').trim();
    console.log('[TESTING PARSER] Stripped code block. Cleaned jsonString:', jsonString);
  }

  // Try to parse as JSON
  if (jsonString) {
    try {
      parsed = JSON.parse(jsonString);
      console.log('[TESTING PARSER] Parsed JSON:', parsed);
      // If parsed is a string (stringified JSON), parse again
      if (typeof parsed === 'string') {
        parsed = JSON.parse(parsed);
        console.log('[TESTING PARSER] Second parse result:', parsed);
      }
    } catch (err) {
      console.error('[TESTING PARSER] Error parsing JSON:', err);
      parsed = null;
    }
  }

  if (parsed && parsed.test_plan !== undefined && parsed.test_suites !== undefined) {
    console.log('[TESTING PARSER] Parsed object is TestingOutput:', parsed);
    return parsed as TestingOutput;
  }

  // Fallback: use enhanced parser for robust QA parsing
  console.log('[TESTING PARSER] Using enhanced QA parser for markdown:', jsonString);
  return parseEnhancedTestingMarkdown(jsonString || '');
}
