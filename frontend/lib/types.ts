export interface User {
  id: number;
  email: string;
  name: string;
}

export interface RoadmapProgress {
  roadmap_id: number;
  title: string;
  total_tasks: number;
  completed_tasks: number;
  completion_percentage: number;
}

export interface DashboardSummary {
  total_roadmaps: number;
  total_modules: number;
  total_tasks: number;
  completed_tasks: number;
  overall_completion_percentage: number;
}

export interface DashboardData {
  user: User;
  summary: DashboardSummary;
  roadmaps: RoadmapProgress[];
}

export interface Roadmap {
  id: number;
  title: string;
}

export interface Module {
  id: number;
  roadmap_id: number;
  month_number: number;
  title: string;
  description: string;
}

export interface Task {
  id: number;
  module_id: number;
  type: "lesson" | "quiz" | "project";
  title: string;
  content_json?: any;
  points?: number;
}

export interface Dataset {
  id: number;
  user_id: number;
  name: string;
  file_path: string;
  rows: number;
  cols: number;
  created_at: string;
}

export interface Run {
  id: number;
  experiment_id: number;
  status: "queued" | "running" | "done" | "failed";
  started_at?: string;
  ended_at?: string;
  metrics_json?: any;
}
