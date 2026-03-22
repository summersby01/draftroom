import type {
  OverallStatus,
  ProjectHistoryActionType,
  ProjectType,
  StageStatus
} from "@/types/project";

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      projects: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          artist: string | null;
          client: string | null;
          project_type: ProjectType;
          received_at: string;
          due_at: string;
          submitted_at: string | null;
          overall_status: OverallStatus;
          submission_done: boolean;
          syllable_status: StageStatus;
          chorus_status: StageStatus;
          verse_status: StageStatus;
          notes: string | null;
          progress_percent: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          artist?: string | null;
          client?: string | null;
          project_type?: ProjectType;
          received_at?: string;
          due_at: string;
          submitted_at?: string | null;
          overall_status?: OverallStatus;
          submission_done?: boolean;
          syllable_status?: StageStatus;
          chorus_status?: StageStatus;
          verse_status?: StageStatus;
          notes?: string | null;
          progress_percent?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          artist?: string | null;
          client?: string | null;
          project_type?: ProjectType;
          received_at?: string;
          due_at?: string;
          submitted_at?: string | null;
          overall_status?: OverallStatus;
          submission_done?: boolean;
          syllable_status?: StageStatus;
          chorus_status?: StageStatus;
          verse_status?: StageStatus;
          notes?: string | null;
          progress_percent?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      project_history: {
        Row: {
          id: string;
          project_id: string;
          user_id: string;
          action_type: ProjectHistoryActionType;
          field_name: string | null;
          old_value: string | null;
          new_value: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          user_id: string;
          action_type: ProjectHistoryActionType;
          field_name?: string | null;
          old_value?: string | null;
          new_value?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          user_id?: string;
          action_type?: ProjectHistoryActionType;
          field_name?: string | null;
          old_value?: string | null;
          new_value?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      overall_status: OverallStatus;
      project_type: ProjectType;
      project_history_action_type: ProjectHistoryActionType;
      stage_status: StageStatus;
    };
    CompositeTypes: Record<string, never>;
  };
}
