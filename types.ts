export interface ExpertProduct {
  name: string;
  type: string;
  price?: string;
  description: string;
  link?: string;
}

export interface ExpertProfile {
  titlePrefix?: string;
  name: string;
  title: string;
  summary: string;
  skills: string[];
  links?: {
    linkedin?: string;
    github?: string;
    website?: string;
    twitter?: string;
  };
  profilePicture?: string;
  services: string[];
  products: ExpertProduct[];
}

export interface TimelineEvent {
  year: string;
  title: string;
  company: string;
  description: string;
}

export interface AtsCv {
  contact: {
    name: string;
    phone: string;
    email: string;
    linkedin: string;
  };
  summary: string;
  skills: string[];
  experience: {
    title: string;
    company: string;
    dates: string;
    responsibilities: string[];
  }[];
  education: {
    degree: string;
    institution: string;
    year: string;
  }[];
}

export interface CourseTopic {
  title: string;
  content?: string;
}

export interface CourseModule {
  title: string;
  objectives: string[];
  topics: CourseTopic[];
  activities: string[];
}

export interface CourseOutline {
  courseTitle: string;
  description: string;
  modules: CourseModule[];
}

export interface SuggestionCategory {
  category: string;
  emoji: string;
  suggestions: string[];
}

export interface AnalysisResult {
  profile: ExpertProfile;
  timeline: TimelineEvent[];
  atsCv: AtsCv;
  courseOutline: CourseOutline;
  assessments?: SuggestionCategory[];
  improvementPlan?: SuggestionCategory[];
}

// Types for the new Library feature
export type SavedItemType = 'services' | 'products' | 'courseOutline' | 'assessments' | 'improvementPlan';

export interface SavedItem {
  id: string;
  type: SavedItemType;
  title: string;
  timestamp: number;
  // The content can be of different shapes based on the type
  content: string[] | ExpertProduct[] | CourseOutline | SuggestionCategory[];
}

export interface Task {
  id: string;
  text: string;
  isCompleted: boolean;
  source?: {
    type: SavedItemType;
    title: string;
    content: any;
  };
  createdAt: number;
}

// --- New Types for Courses Page ---

export interface Program {
  id: string;
  title: string;
  instructor: string;
  icon: 'FireIcon' | 'CrownIcon';
  isRecommended?: boolean;
  duration: string;
  level: string;
  pathType: string;
  discount: string;
  description: string;
  contents: string[];
  requirements: string[];
  packageIncludes: { item: string; value: string }[];
  totalValue: string;
  investment: string;
  originalPrice: string;
  themeColor: 'orange' | 'indigo';
}

export interface GiftModule {
    title: string;
    items: string[];
}

export interface GiftCourse {
    title: string;
    description: string;
    modules: GiftModule[];
}

export interface SpecializedCourse {
    id: string;
    title: string;
    instructor: string;
    description: string;
    price: string;
    contents: string[];
}

// --- New Type for AI Agentic Tools ---
export type AITool = 'content' | 'image' | 'video' | 'marketingPlan' | 'marketResearch' | 'swot';
