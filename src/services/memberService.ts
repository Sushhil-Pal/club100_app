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