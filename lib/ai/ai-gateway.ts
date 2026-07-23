import { GoogleGenerativeAI } from '@google/generative-ai';
import { z } from 'zod';

export type AIFeature =
  | 'chat'
  | 'resume'
  | 'study-planner'
  | 'summarizer'
  | 'quiz-generator'
  | 'mock-interview'
  | 'career'
  | 'advisor'
  | 'placement-roadmap';

export type AIRequest = {
  feature: AIFeature;
  prompt: string;
  context?: Record<string, unknown>;
};

export type AIResponse = {
  content: string;
  feature: AIFeature;
  timestamp: Date;
};

// Zod Schema for strict Roadmap Stage output validation
export const roadmapStageOutputSchema = z.object({
  order: z.number(),
  title: z.string().min(2),
  description: z.string().min(5),
  durationLabel: z.string().min(2),
});

export type RoadmapStageOutput = z.infer<typeof roadmapStageOutputSchema>;

/**
 * Universal AI Gateway client for CampusAI.
 * Routes prompts to Google Gemini API with error handling.
 */
export async function aiGateway(request: AIRequest): Promise<AIResponse> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error('GEMINI_API_KEY environment variable is not configured.');
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  const result = await model.generateContent(request.prompt);
  const responseText = result.response.text();

  return {
    content: responseText,
    feature: request.feature,
    timestamp: new Date(),
  };
}

/**
 * Generate a domain placement preparation roadmap with strict JSON parsing & fallback.
 */
export async function generatePlacementRoadmap(
  domainName: string,
  domainDescription: string
): Promise<RoadmapStageOutput[]> {
  const prompt = `
You are an expert technical interviewer and placement preparation coach at a top tech institution.
Create a comprehensive, 6 to 8 stage Placement Preparation Roadmap for a student preparing for:
Domain: "${domainName}"
Description: "${domainDescription}"

CRITICAL INSTRUCTION: You MUST return ONLY a raw JSON array of objects. Do not include markdown headers or conversational commentary outside the JSON.
Each stage object MUST strictly conform to this JSON schema:
[
  {
    "order": 1,
    "title": "Stage Title",
    "description": "Clear step-by-step guidance on what to learn and practice in this stage.",
    "durationLabel": "Weeks 1-2"
  }
]

Provide structured, realistic stages covering foundational concepts, core technologies, problem solving, system design/projects, and interview preparation.
`;

  // Attempt 1: Gemini API call
  try {
    const aiRes = await aiGateway({
      feature: 'placement-roadmap',
      prompt,
      context: { domainName, domainDescription },
    });

    const parsed = parseRoadmapJson(aiRes.content);
    if (parsed && parsed.length > 0) {
      return parsed;
    }
  } catch (err: unknown) {
    console.warn(`[AI Gateway] Gemini API attempt 1 failed: ${(err as Error).message}. Retrying once...`);
  }

  // Attempt 2: Retry once with explicit json formatting instruction
  try {
    const aiRes = await aiGateway({
      feature: 'placement-roadmap',
      prompt: `${prompt}\n\nRETRY NOTE: Ensure response starts with '[' and ends with ']'. Raw JSON only.`,
    });

    const parsed = parseRoadmapJson(aiRes.content);
    if (parsed && parsed.length > 0) {
      return parsed;
    }
  } catch (err: unknown) {
    console.warn(`[AI Gateway] Gemini API attempt 2 failed: ${(err as Error).message}. Using domain fallback.`);
  }

  // Graceful Fallback if Gemini API key is missing or response is unparseable
  return getDomainFallbackRoadmap(domainName);
}

/**
 * Helper to parse and defensively validate JSON response from Gemini
 */
function parseRoadmapJson(rawContent: string): RoadmapStageOutput[] | null {
  try {
    let cleanStr = rawContent.trim();
    // Remove markdown code fence if present
    if (cleanStr.startsWith('```')) {
      cleanStr = cleanStr.replace(/^```(json)?\n?/, '').replace(/\n?```$/, '').trim();
    }

    const json = JSON.parse(cleanStr);
    if (!Array.isArray(json)) return null;

    const validated = z.array(roadmapStageOutputSchema).parse(json);
    return validated.sort((a, b) => a.order - b.order);
  } catch (e) {
    console.error('[AI Gateway] Failed to parse roadmap JSON from AI response:', e);
    return null;
  }
}

/**
 * High-quality domain fallback roadmap if Gemini API is unreachable or returns malformed response.
 */
function getDomainFallbackRoadmap(domainName: string): RoadmapStageOutput[] {
  const isFrontend = domainName.toLowerCase().includes('frontend');
  const isData = domainName.toLowerCase().includes('data');

  if (isFrontend) {
    return [
      {
        order: 1,
        title: 'Core JS & ES6+ Mastery',
        description: 'Master JavaScript fundamentals: closures, promises, async/await, event loop, and DOM manipulation.',
        durationLabel: 'Weeks 1-2',
      },
      {
        order: 2,
        title: 'Modern React & State Management',
        description: 'Build components, manage hooks (useState, useEffect, useMemo), Context API, and state libraries.',
        durationLabel: 'Weeks 3-4',
      },
      {
        order: 3,
        title: 'HTML5, CSS3 & Responsive UI Design',
        description: 'Master Flexbox, Grid, CSS animations, Tailwind CSS, accessibility (a11y), and semantic HTML.',
        durationLabel: 'Weeks 5-6',
      },
      {
        order: 4,
        title: 'Frontend Performance & Testing',
        description: 'Optimize bundle size, code splitting, lazy loading, web vitals, and Jest/React Testing Library.',
        durationLabel: 'Weeks 7-8',
      },
      {
        order: 5,
        title: 'Frontend Machine Coding & Systems',
        description: 'Build real-time apps: autocomplete search, infinite scroll, data tables, and modal dialogs.',
        durationLabel: 'Weeks 9-10',
      },
      {
        order: 6,
        title: 'Interview Prep & Capstone Projects',
        description: 'Mock interviews, portfolio refinement, system design for frontend applications, and web security.',
        durationLabel: 'Weeks 11-12',
      },
    ];
  }

  if (isData) {
    return [
      {
        order: 1,
        title: 'Python Programming & Math Foundations',
        description: 'Master Python data structures, NumPy, Pandas, linear algebra, calculus, and probability basics.',
        durationLabel: 'Weeks 1-2',
      },
      {
        order: 2,
        title: 'Data Cleaning & Exploratory Data Analysis (EDA)',
        description: 'Clean structured/unstructured data, visualization with Matplotlib/Seaborn, and statistical tests.',
        durationLabel: 'Weeks 3-4',
      },
      {
        order: 3,
        title: 'Supervised & Unsupervised Machine Learning',
        description: 'Implement regression, classification, decision trees, random forests, clustering, and Scikit-Learn.',
        durationLabel: 'Weeks 5-6',
      },
      {
        order: 4,
        title: 'SQL & Database Queries for Analytics',
        description: 'Complex SQL queries, window functions, CTEs, joins, query optimization, and data modeling.',
        durationLabel: 'Weeks 7-8',
      },
      {
        order: 5,
        title: 'Deep Learning & Neural Networks',
        description: 'Fundamentals of PyTorch/TensorFlow, CNNs, RNNs, and transformer models for ML roles.',
        durationLabel: 'Weeks 9-10',
      },
      {
        order: 6,
        title: 'ML System Design & Portfolio Projects',
        description: 'Deploy ML pipelines with FastAPI/Docker, model monitoring, and end-to-end analytics projects.',
        durationLabel: 'Weeks 11-12',
      },
    ];
  }

  // Default: SDE / Backend Development
  return [
    {
      order: 1,
      title: 'Programming Language & Core Fundamentals',
      description: 'Master a core language (Java, C++, or Python) along with Memory Management, OOPs, and OS fundamentals.',
      durationLabel: 'Weeks 1-2',
    },
    {
      order: 2,
      title: 'Data Structures & Algorithms (Basic to Intermediate)',
      description: 'Solve Arrays, Strings, Hashing, Two Pointers, Linked Lists, Stacks, Queues, and Recursion.',
      durationLabel: 'Weeks 3-5',
    },
    {
      order: 3,
      title: 'Advanced DSA & Problem Solving',
      description: 'Master Trees, Graphs, Dynamic Programming, Greedy Algorithms, and Binary Search patterns.',
      durationLabel: 'Weeks 6-8',
    },
    {
      order: 4,
      title: 'DBMS, SQL & System Architecture',
      description: 'Relational databases, indexing, transactions (ACID), Normalization, and complex SQL joins.',
      durationLabel: 'Weeks 9-10',
    },
    {
      order: 5,
      title: 'Low Level & High Level System Design (LLD/HLD)',
      description: 'Design patterns, microservices, load balancing, caching (Redis), queues (Kafka), and scalability.',
      durationLabel: 'Weeks 11-12',
    },
    {
      order: 6,
      title: 'Full Mock Interviews & Resume Review',
      description: 'Practice behavioral questions, live coding rounds, technical mocks, and resume project defense.',
      durationLabel: 'Weeks 13-14',
    },
  ];
}
