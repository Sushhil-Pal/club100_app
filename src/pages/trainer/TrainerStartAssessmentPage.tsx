import { useEffect } from "react";
import {
  useNavigate,
  useSearchParams,
} from "react-router-dom";

import { useMutation } from "@tanstack/react-query";

import {
  startTrainerAssessment,
} from "../../services/trainerService";

export default function TrainerStartAssessmentPage() {
  const navigate = useNavigate();

  const [searchParams] =
    useSearchParams();

  const memberId =
    searchParams.get("member");

  const assessmentMutation =
    useMutation({
      mutationFn: () =>
        startTrainerAssessment(
          memberId!
        ),

      onSuccess: (response) => {
        navigate(
          `/trainer/assessment/${response.assessment.id}`,
          {
            replace: true,
          }
        );
      },
    });

  useEffect(() => {
    if (!memberId) {
      navigate(
        "/trainer/members",
        {
          replace: true,
        }
      );

      return;
    }

    if (
      !assessmentMutation.isPending &&
      !assessmentMutation.isSuccess &&
      !assessmentMutation.isError
    ) {
      assessmentMutation.mutate();
    }
  }, [
    memberId,
    navigate,
    assessmentMutation,
  ]);

  if (
    !memberId
  ) {
    return null;
  }

  if (
    assessmentMutation.isError
  ) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
        <p className="font-medium text-red-700">
          We couldn&apos;t start the assessment.
        </p>

        <button
          type="button"
          onClick={() =>
            navigate(
              `/trainer/members/${memberId}`
            )
          }
          className="mt-4 text-sm font-semibold text-[#2F80ED]"
        >
          Back to member
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm">
      <p className="text-sm text-slate-500">
        Starting assessment...
      </p>
    </div>
  );
}