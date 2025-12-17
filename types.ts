

export enum ContentType {
  SUMMARY = 'Summary',
  BLOG_POST = 'Blog Post',
  NEWS_ARTICLE = 'News Article',
  LINKEDIN_POST = 'LinkedIn Post',
  TWEET_THREAD = 'X (Twitter) Thread',
  ELI5 = 'Explain Like I\'m 5',
  CLIENT_REPORT = 'Client Report'
}

export enum Language {
  ENGLISH = 'English',
  HINDI = 'Hindi',
  KANNADA = 'Kannada',
  TAMIL = 'Tamil',
  TELUGU = 'Telugu',
  SPANISH = 'Spanish',
  FRENCH = 'French',
  GERMAN = 'German'
}

export enum Persona {
  DEFAULT = 'Professional AI',
  JOURNALIST = 'Investigative Journalist',
  COMEDIAN = 'Stand-up Comedian',
  POLITICIAN = 'Diplomatic Politician',
  TECH_INFLUENCER = 'Tech Influencer',
  ACADEMIC = 'Academic Researcher',
  STARTUP_FOUNDER = 'Startup Founder',
  HR_CORP = 'Corporate HR'
}

export enum Template {
  NONE = 'Standard Structure',
  STARTUP_STORY = 'Startup Origin Story',
  EDUCATIONAL = 'Educational Course',
  GEOPOLITICAL = 'Geopolitical Analysis',
  LIVE_EVENT = 'Live Seminar Coverage',
  DEBATE = 'Debate Summary'
}

export type ResearchMode = 'strict' | 'enhanced';

export type ToolMode = 'report' | 'social' | 'audio' | 'blog';

export type SocialPlatform = 'LinkedIn' | 'Medium' | 'Twitter';

export interface AgencyConfig {
  name: string;
  clientName: string;
  logo: string | null; // Base64 string
}

export interface TimestampConfig {
  enabled: boolean;
  start: string; // HH:MM:SS format
  end: string;   // HH:MM:SS format
}

export interface Source {
  title: string;
  url: string;
}

export interface User {
  id: string;
  email: string;
  passwordHash: string; // Simulated hash
  agencyName?: string;
  name: string;
}

export interface UserSession {
  isAuthenticated: boolean;
  user: User | null;
}

export interface AppState {
  file: File | null;
  youtubeUrl: string;
  contentType: ContentType;
  language: Language;
  persona: Persona;
  template: Template;
  researchMode: ResearchMode;
  timestamps: TimestampConfig;
  agency: AgencyConfig;
  generatedContent: string;
  audioUrl: string | null;
  sources: Source[];
  isProcessing: boolean;
  isGeneratingAudio: boolean;
  error: string | null;
  currentStep: number;
}