// Re-export from firestore types
import type { Question as QuestionType } from "./firestore";
export type { QuestionFilter, AIQuestionGenerationRequest, AIQuestionGenerationResponse, QuestionApprovalRequest } from "./firestore";
export type Question = QuestionType;

/**
 * Question with metadata for display
 */
export interface QuestionDisplay {
  questionId: string;
  text: string;
  options: [string, string, string, string];
  // answers hidden until revealed
}

/**
 * Question with answer (for review/stats)
 */
export interface QuestionWithAnswer {
  questionId: string;
  text: string;
  options: [string, string, string, string];
  correctIndex: 0 | 1 | 2 | 3;
  selectedIndex?: 0 | 1 | 2 | 3;
  isCorrect: boolean;
}

/**
 * Batch question operation
 */
export interface QuestionBatchOperation {
  operation: "create" | "update" | "delete" | "approve";
  questions: Partial<Question>[];
}
