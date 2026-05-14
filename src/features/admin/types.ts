import type { Question, Region, GameMap, AdminLog } from "@/src/types/firestore";

/**
 * Admin Dashboard Stats
 */
export interface AdminDashboardStats {
  totalUsers: number;
  totalQuestions: number;
  unapprovedQuestions: number;
  totalRegions: number;
  totalGamesPlayed: number;
  totalRoomsCreated: number;
  activeRoomsNow: number;
}

/**
 * Question Management View
 */
export interface QuestionManagementView {
  questions: Question[];
  filters: {
    mapId?: string;
    regionId?: string;
    isApproved?: boolean;
    generatedBy?: "ai" | "manual";
  };
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
}

/**
 * Region Management View
 */
export interface RegionManagementView {
  regions: Region[];
  filters: {
    mapId?: string;
    isActive?: boolean;
  };
}

/**
 * AI Generation Job
 */
export interface AIGenerationJob {
  jobId: string;
  status: "pending" | "processing" | "completed" | "failed";
  regionId: string;
  mapId: string;
  count: number;
  customPrompt?: string;
  generatedQuestions?: Partial<Question>[];
  error?: string;
  createdAt: number;
  completedAt?: number;
}

/**
 * Bulk Import CSV Format
 */
export interface QuestionCSVRow {
  regionId: string;
  mapId: string;
  text: string;
  option1: string;
  option2: string;
  option3: string;
  option4: string;
  correctIndex: 0 | 1 | 2 | 3;
}

/**
 * Admin Audit
 */
export interface AdminAuditView {
  logs: AdminLog[];
  filters: {
    adminUid?: string;
    action?: string;
    dateRange?: {
      start: number;
      end: number;
    };
  };
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
}

/**
 * Admin Permission
 */
export interface AdminPermission {
  canCreateQuestions: boolean;
  canApproveQuestions: boolean;
  canDeleteQuestions: boolean;
  canManageRegions: boolean;
  canManageMaps: boolean;
  canViewAnalytics: boolean;
  canManageUsers: boolean;
}

/**
 * Admin Whitelist Entry
 */
export interface AdminWhitelistEntry {
  email: string;
  name?: string;
  permissions: AdminPermission;
  addedAt: number;
  addedBy?: string;
}
