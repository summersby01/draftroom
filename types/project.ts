export type StageStatus = "not_started" | "in_progress" | "completed";
export type OverallStatus =
  | "planned"
  | "in_progress"
  | "submitted"
  | "on_hold"
  | "overdue";
export type ProjectType =
  | "lyrics"
  | "adaptation"
  | "ost"
  | "idol"
  | "topline"
  | "other";
export type DeadlineRiskType = "overdue" | "due_today" | "due_soon" | "at_risk" | "collision";
export type ProjectHistoryActionType =
  | "project_created"
  | "project_updated"
  | "stage_updated"
  | "due_date_changed"
  | "submission_marked"
  | "submission_unmarked"
  | "note_updated";

export interface Project {
  id: string;
  user_id: string;
  title: string;
  artist: string | null;
  client: string | null;
  project_type: ProjectType;
  received_at: string;
  due_at: string;
  due_time: string | null;
  submitted_at: string | null;
  is_accepted: boolean;
  is_portfolio: boolean;
  accepted_at: string | null;
  portfolio_note: string | null;
  overall_status: OverallStatus;
  submission_done: boolean;
  syllable_status: StageStatus;
  chorus_status: StageStatus;
  verse_status: StageStatus;
  notes: string | null;
  progress_percent: number;
  created_at: string;
  updated_at: string;
}

export interface ProjectHistory {
  id: string;
  project_id: string;
  user_id: string;
  action_type: ProjectHistoryActionType;
  field_name: string | null;
  old_value: string | null;
  new_value: string | null;
  created_at: string;
}

export interface ProjectRisk {
  type: DeadlineRiskType;
  label: string;
  tone: "red" | "amber" | "plum" | "navy";
}

export interface ActivityMessage {
  id: string;
  project_id: string;
  title: string;
  message: string;
  created_at: string;
}

export interface DashboardStats {
  inProgressCount: number;
  dueTodayCount: number;
  dueSoonCount: number;
  overdueCount: number;
  submittedThisMonthCount: number;
}

export interface ArchiveStats {
  totalSubmitted: number;
  submittedThisYear: number;
  averageCompletionDays: number;
  acceptedCount: number;
  acceptanceRate: number;
  portfolioCount: number;
}

export interface ArchiveActivityDay {
  date: string;
  dayOfMonth: number;
  isCurrentMonth: boolean;
  submittedCount: number;
  progressUnits: number;
  changeCount: number;
  activityLevel: number;
  submittedProjects: ArchiveActivitySubmission[];
  progressChanges: ArchiveActivityChange[];
}

export interface ArchiveActivitySubmission {
  id: string;
  title: string;
  submittedAt: string;
}

export interface ArchiveActivityChange {
  id: string;
  projectId: string;
  title: string;
  fieldName: string;
  oldValue: string | null;
  newValue: string | null;
  createdAt: string;
  progressUnits: number;
  message: string;
}

export interface ArchiveActivitySummary {
  submissionsThisMonth: number;
  totalProgressActivityThisMonth: number;
  busiestDay: {
    date: string;
    label: string;
    submittedCount: number;
    progressUnits: number;
    changeCount: number;
  } | null;
}

export interface ArchiveActivityData {
  month: string;
  monthLabel: string;
  days: ArchiveActivityDay[];
  maxSubmittedCount: number;
  maxProgressUnits: number;
  maxActivityLevel: number;
  summary: ArchiveActivitySummary;
}

export type ProjectInsert = Omit<
  Project,
  "id" | "created_at" | "updated_at" | "progress_percent" | "submitted_at" | "overall_status"
>;

export type ProjectUpdate = Partial<ProjectInsert> & {
  overall_status?: OverallStatus;
};

export interface ProjectFilters {
  query?: string;
  status?: OverallStatus | "all";
  type?: ProjectType | "all";
  submitted?: "all" | "yes" | "no";
  sort?: "due_at" | "received_at" | "updated_at" | "created_at" | "progress_percent";
  direction?: "asc" | "desc";
  year?: string;
  archivedOnly?: boolean;
}
