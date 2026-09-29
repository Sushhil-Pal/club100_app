import { apiPost } from "./api";

export type SubmitFeedbackRequest = {
  sessionId: string;
  overallRating: number;
  difficultyRating:
    | "Too Easy"
    | "Just Right"
    | "Challenging"
    | "Too Difficult";
  trainerRating: number;
  energyAfterSession:
    | "Low"
    | "Same"
    | "Better"
    | "Excellent";
  wouldRecommend: boolean;
  comments?: string;
};

export type SubmitFeedbackResponse = {
  success: boolean;
  feedbackId: string;
};

export async function submitFeedback(
  input: SubmitFeedbackRequest
): Promise<SubmitFeedbackResponse> {
  return apiPost<SubmitFeedbackResponse>(
    "/api/method/club100_core.api.feedback.submit_feedback",
    {
      session_id: input.sessionId,
      overall_rating: input.overallRating,
      difficulty_rating:
        input.difficultyRating,
      trainer_rating:
        input.trainerRating,
      energy_after_session:
        input.energyAfterSession,
      would_recommend:
        input.wouldRecommend ? 1 : 0,
      comments:
        input.comments ?? "",
    }
  );
}