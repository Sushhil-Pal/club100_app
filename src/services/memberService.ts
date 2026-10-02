import type { Member } from "../types/member";
import {
  apiGet,
  apiPost,
} from "./api";

export async function getCurrentMember(): Promise<Member> {
  return apiGet<Member>(
    "/api/method/club100_core.api.member.me"
  );
}

export type UpdateProfileInput = {
  fullName: string;
  email: string;
  mobile: string;
};

export type UpdateProfileResponse = {
  success: boolean;
  member: Member;
};

export async function updateProfile(
  input: UpdateProfileInput
): Promise<UpdateProfileResponse> {
  return apiPost<UpdateProfileResponse>(
    "/api/method/club100_core.api.member.update_profile",
    {
      full_name: input.fullName,
      email: input.email,
      mobile: input.mobile,
    }
  );
}

export type CompleteOnboardingInput = {
  dateOfBirth: string;
  gender: string;
  fitnessGoal: string;
  currentFitnessLevel: string;
  preferredDeliveryMode: string;
  medicalNotes?: string;
};

export type CompleteOnboardingResponse = {
  success: boolean;
  member: {
    id: string;
    fullName: string;

    dateOfBirth: string | null;
    gender: string | null;

    fitnessLevel: string | null;

    fitnessGoal: string | null;

    preferredDeliveryMode:
      string | null;

    medicalNotes: string | null;

    onboardingStatus:
      | "Not Started"
      | "In Progress"
      | "Completed";

    onboardingCompletedOn:
      string | null;
  };
};

export async function completeOnboarding(
  input: CompleteOnboardingInput
): Promise<CompleteOnboardingResponse> {
  return apiPost<CompleteOnboardingResponse>(
    "/api/method/club100_core.api.member.complete_onboarding",
    {
      date_of_birth:
        input.dateOfBirth,

      gender:
        input.gender,

      fitness_goal:
        input.fitnessGoal,

      current_fitness_level:
        input.currentFitnessLevel,

      preferred_delivery_mode:
        input.preferredDeliveryMode,

      medical_notes:
        input.medicalNotes ?? "",
    }
  );
}


export type MemberProgress = {
  hasAssessment: boolean;

  hasPreviousAssessment: boolean;

  currentAssessment: {
    id: string;
    type: string;
    date: string;
    fitnessLevel: string | null;
  } | null;

  previousAssessment: {
    id: string;
    type: string;
    date: string;
    fitnessLevel: string | null;
  } | null;

  fitnessScore: {
    current: number | null;
    previous: number | null;
    change: number | null;
  };

  categoryScores: {
    category: string;
    current: number | null;
    previous: number | null;
    change: number | null;
  }[];

  assessments: {
    id: string;
    type: string;
    date: string;
    score: number | null;
    fitnessLevel: string | null;
    change: number | null;
  }[];
};

export async function getMemberProgress(): Promise<MemberProgress> {
  return apiGet<MemberProgress>(
    "/api/method/club100_core.api.member.progress"
  );
}

export type MemberAssessmentResult = {
  assessment: {
    id: string;

    assessmentType: string;
    assessmentDate: string;
    deliveryMode: string;

    fitnessScore: number | null;
    fitnessLevel: string | null;

    categories: {
      category: string;
      score: number | null;
      weight: number | null;
      metricsScored: number;
    }[];

    metrics: {
      metric: string;
      metricName: string;
      category: string;

      value: number | null;
      textValue: string | null;
      unit: string | null;

      score: number | null;
      rating: string | null;

      includeInScore: boolean;
    }[];

    previousAssessment: {
      id: string;

      assessmentType: string;
      assessmentDate: string;

      fitnessScore: number | null;
      fitnessLevel: string | null;

      categories: {
        category: string;
        score: number | null;
      }[];

      metrics: {
        metric: string;
        metricName: string;
        category: string;

        value: number | null;
        textValue: string | null;
        unit: string | null;

        score: number | null;
        rating: string | null;

        includeInScore: boolean;
      }[];
    } | null;
  };
};

export async function getMemberAssessmentResult(
  assessmentId: string
): Promise<MemberAssessmentResult> {
  const params =
    new URLSearchParams();

  params.set(
    "assessment_id",
    assessmentId
  );

  return apiGet<MemberAssessmentResult>(
    `/api/method/club100_core.api.member.assessment_result?${params.toString()}`
  );
}