import {
  apiGet,
  apiPost,
} from "./api";

export type TrainerMemberSummary = {
  id: string;
  fullName: string;
  mobile: string | null;
  email: string | null;
  gender: string | null;
  dateOfBirth: string | null;
  onboardingStatus: string;
};

type TrainerMembersResponse = {
  members: TrainerMemberSummary[];
};

export async function getTrainerMembers(
  search: string
): Promise<TrainerMemberSummary[]> {
  const normalizedSearch =
    search.trim();

  if (normalizedSearch.length < 2) {
    return [];
  }

  const params =
    new URLSearchParams();

  params.set(
    "search",
    normalizedSearch
  );

  const result =
    await apiGet<TrainerMembersResponse>(
      `/api/method/club100_core.api.trainer.members?${params.toString()}`
    );

  return result.members;
}

export type TrainerMemberDetail = {
  member: {
    id: string;
    fullName: string;
    mobile: string | null;
    email: string | null;
    gender: string | null;
    dateOfBirth: string | null;
    joiningDate: string | null;
    onboardingStatus: string;
  };

  latestAssessment: {
    id: string;
    type: string;
    date: string;
    fitnessScore: number | null;
    fitnessLevel: string | null;
  } | null;

  assessmentCount: number;
};

export async function getTrainerMemberDetail(
  memberId: string
): Promise<TrainerMemberDetail> {
  const params =
    new URLSearchParams();

  params.set(
    "member_id",
    memberId
  );

  return apiGet<TrainerMemberDetail>(
    `/api/method/club100_core.api.trainer.member_detail?${params.toString()}`
  );
}

export type StartAssessmentResponse = {
  assessment: {
    id: string;
    member: string;
    status: string;
    assessmentType: string;
    assessmentDate: string;
    template: string;
  };

  resumed: boolean;
};

export async function startTrainerAssessment(
  memberId: string
): Promise<StartAssessmentResponse> {
  return apiPost<StartAssessmentResponse>(
    "/api/method/club100_core.api.trainer.start_assessment",
    {
      member_id: memberId,
      delivery_mode: "Offline",
    }
  );
}

export type TrainerAssessmentInput = {
  rowId: string;
  input: string;
  inputName: string;
  inputCode: string | null;
  category: string;
  resultType: string;
  unit: string | null;
  required: boolean;

  value: number | null;
  hasValue: boolean;
  textValue: string | null;
  notes: string | null;

  options: string | null;
  description: string | null;
  instructions: string | null;
};

export type TrainerAssessmentDetail = {
  assessment: {
    id: string;

    member: {
      id: string;
      fullName: string;
      gender: string | null;
      dateOfBirth: string | null;
    };

    assessmentType: string;
    assessmentDate: string;
    deliveryMode: string;
    status: string;
    template: string;

    inputs: TrainerAssessmentInput[];
  };
};

export async function getTrainerAssessment(
  assessmentId: string
): Promise<TrainerAssessmentDetail> {
  const params =
    new URLSearchParams();

  params.set(
    "assessment_id",
    assessmentId
  );

  return apiGet<TrainerAssessmentDetail>(
    `/api/method/club100_core.api.trainer.assessment_detail?${params.toString()}`
  );
}

export type SaveTrainerAssessmentInput = {
  rowId: string;
  value: number | null;
  textValue: string | null;
};

export type SaveTrainerAssessmentResponse = {
  success: boolean;

  assessment: {
    id: string;
    status: string;
    fitnessScore: number | null;
    fitnessLevel: string | null;
  };
};

export async function saveTrainerAssessment(
  assessmentId: string,
  inputs: SaveTrainerAssessmentInput[],
  status: "Draft" | "Completed"
): Promise<SaveTrainerAssessmentResponse> {
  return apiPost<SaveTrainerAssessmentResponse>(
    "/api/method/club100_core.api.trainer.save_assessment",
    {
      assessment_id: assessmentId,
      inputs,
      status,
    }
  );
}

export type TrainerAssessmentResult = {
  assessment: {
    id: string;

    member: {
      id: string;
      fullName: string;
      gender: string | null;
      dateOfBirth: string | null;
    };

    assessmentType: string;
    assessmentDate: string;
    deliveryMode: string;
    status: string;

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

      required: boolean;
      includeInScore: boolean;

      weight: number | null;
      notes: string | null;
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

export async function getTrainerAssessmentResult(
  assessmentId: string
): Promise<TrainerAssessmentResult> {
  const params =
    new URLSearchParams();

  params.set(
    "assessment_id",
    assessmentId
  );

  return apiGet<TrainerAssessmentResult>(
    `/api/method/club100_core.api.trainer.assessment_result?${params.toString()}`
  );
}


export type TrainerAssessmentSummary = {
  id: string;

  member: {
    id: string;
    fullName: string;
    mobile: string | null;
  };

  assessmentType: string;
  assessmentDate: string;
  deliveryMode: string;
  status: string;

  fitnessScore: number | null;
  fitnessLevel: string | null;
};

type TrainerAssessmentsResponse = {
  assessments:
    TrainerAssessmentSummary[];
};

export async function getTrainerAssessments(
  search = "",
  status = ""
): Promise<
  TrainerAssessmentSummary[]
> {
  const params =
    new URLSearchParams();

  if (search.trim()) {
    params.set(
      "search",
      search.trim()
    );
  }

  if (status) {
    params.set(
      "status",
      status
    );
  }

  const result =
    await apiGet<
      TrainerAssessmentsResponse
    >(
      `/api/method/club100_core.api.trainer.assessments?${params.toString()}`
    );

  return result.assessments;
}

export type TrainerSessionSummary = {
  id: string;

  cohort: {
    id: string;
    name: string;
  };

  program: {
    id: string;
    name: string;
  };

  sessionDate: string;
  startTime: string | null;
  endTime: string | null;

  deliveryMode: string;
  status: string;

  meetingProvider: string | null;
  meetingUrl: string | null;

  attendanceSynced: boolean;
};

type TrainerSessionsResponse = {
  sessions: TrainerSessionSummary[];
};

export async function getTrainerSessions(
  status = ""
): Promise<TrainerSessionSummary[]> {
  const params =
    new URLSearchParams();

  if (status) {
    params.set(
      "status",
      status
    );
  }

  const result =
    await apiGet<
      TrainerSessionsResponse
    >(
      `/api/method/club100_core.api.trainer.sessions?${params.toString()}`
    );

  return result.sessions;
}

export type TrainerSessionDetail = {
  session: {
    id: string;

    cohort: {
      id: string;
      name: string;
    };

    program: {
      id: string;
      name: string;
    };

    sessionDate: string;
    startTime: string | null;
    endTime: string | null;

    deliveryMode: string;
    status: string;

    meetingProvider: string | null;
    meetingUrl: string | null;

    notes: string | null;

    attendanceSynced: boolean;

    participants: {
      enrollmentId: string;

      member: {
        id: string;
        fullName: string;
        mobile: string | null;
        email: string | null;
      };

      attendance: {
        id: string;
        status: string;
        mode: string;
        source: string;
        minutesAttended: number | null;
        notes: string | null;
      } | null;
    }[];
  };
};

export async function getTrainerSessionDetail(
  sessionId: string
): Promise<TrainerSessionDetail> {
  const params =
    new URLSearchParams();

  params.set(
    "session_id",
    sessionId
  );

  return apiGet<TrainerSessionDetail>(
    `/api/method/club100_core.api.trainer.session_detail?${params.toString()}`
  );
}

export type SaveSessionAttendanceInput = {
  memberId: string;
  status:
    | "Present"
    | "Partial"
    | "Absent";

  notes?: string;
};

export async function saveTrainerSessionAttendance(
  sessionId: string,
  attendance: SaveSessionAttendanceInput[]
): Promise<{
  success: boolean;
  saved: number;
}> {
  return apiPost(
    "/api/method/club100_core.api.trainer.save_session_attendance",
    {
      session_id:
        sessionId,

      attendance,
    }
  );
}

export async function completeTrainerSession(
  sessionId: string
): Promise<{
  success: boolean;

  session: {
    id: string;
    status: string;
  };
}> {
  return apiPost(
    "/api/method/club100_core.api.trainer.complete_session",
    {
      session_id:
        sessionId,
    }
  );
}

export type TrainerTodayData = {
  date: string;

  summary: {
    sessions: number;
    scheduled: number;
    live: number;
    completed: number;
    draftAssessments: number;
  };

  sessions: {
    id: string;

    cohort: {
      id: string;
      name: string;
    };

    program: {
      id: string;
      name: string;
    };

    sessionDate: string;
    startTime: string | null;
    endTime: string | null;

    deliveryMode: string;
    status: string;

    meetingProvider: string | null;
    meetingUrl: string | null;
  }[];

  draftAssessments: {
    id: string;

    assessmentType: string;
    assessmentDate: string | null;
    modified: string;

    member: {
      id: string;
      fullName: string;
      mobile: string | null;
    };
  }[];
};

export async function getTrainerToday(): Promise<TrainerTodayData> {
  return apiGet<TrainerTodayData>(
    "/api/method/club100_core.api.trainer.today"
  );
}