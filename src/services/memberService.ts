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

export type MemberScheduleSession = {
  id: string;

  program: {
    id: string;
    name: string;
  };

  cohort: {
    id: string;
    name: string;
    fitnessLevel:
      string | null;
  };

  trainer: {
    id: string;
    name: string;
  };

  sessionDate: string;

  startTime:
    string | null;

  endTime:
    string | null;

  deliveryMode: string;

  status: string;

  meetingProvider:
    string | null;

  meetingUrl:
    string | null;

  notes:
    string | null;

  attendance: {
    status: string;
    minutesAttended:
      number | null;
    notes:
      string | null;
  } | null;
};

export type MemberSchedule = {
  upcoming:
    MemberScheduleSession[];

  past:
    MemberScheduleSession[];
};

export async function getMemberSchedule(): Promise<MemberSchedule> {
  return apiGet<MemberSchedule>(
    "/api/method/club100_core.api.member.schedule"
  );
}

export type MemberSessionDetail = {
  session: {
    id: string;

    status:
      | "Scheduled"
      | "Live"
      | "Completed"
      | "Cancelled"
      | string;

    sessionDate: string;

    startTime:
      string | null;

    endTime:
      string | null;

    deliveryMode:
      string | null;

    meetingProvider:
      string | null;

    meetingUrl:
      string | null;

    notes:
      string | null;

    workoutContent: {
      id: string;

      title: string;

      format:
        string | null;

      fitnessLevel:
        string | null;

      durationMinutes:
        number | null;

      equipmentRequired:
        string | null;

      videoUrl:
        string | null;

      thumbnail:
        string | null;

      instructions:
        string | null;
    } | null;

    program: {
      id: string;
      name: string;

      description:
        string | null;

      sessionDurationMinutes:
        number | null;
    };

    cohort: {
      id: string;
      name: string;

      fitnessLevel:
        string | null;
    };

    trainer: {
      id: string;
      name: string;

      photo:
        string | null;

      bio:
        string | null;
    } | null;

    attendance: {
      status: string;

      mode:
        string | null;

      minutesAttended:
        number | null;

      notes:
        string | null;
    } | null;

    feedback: {
      submitted: boolean;

      id:
        string | null;
    };
  };
};

export async function getMemberSessionDetail(
  sessionId: string
): Promise<MemberSessionDetail> {
  const params =
    new URLSearchParams();

  params.set(
    "session_id",
    sessionId
  );

  return apiGet<MemberSessionDetail>(
    `/api/method/club100_core.api.member.session_detail?${params.toString()}`
  );
}