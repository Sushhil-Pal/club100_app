import {
  useState,
} from "react";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  getMemberSessionDetail,
} from "../services/memberService";

import {
  submitFeedback,
} from "../services/feedbackService";

type DifficultyRating =
  | "Too Easy"
  | "Just Right"
  | "Challenging"
  | "Too Difficult";

type EnergyRating =
  | "Low"
  | "Same"
  | "Better"
  | "Excellent";

function formatDate(
  value: string
) {
  const date =
    new Date(
      `${value}T00:00:00`
    );

  return date.toLocaleDateString(
    undefined,
    {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    }
  );
}

function RatingButtons({
  value,
  onChange,
}: {
  value:
    number | null;

  onChange:
    (value: number) => void;
}) {
  return (
    <div className="mt-5 flex gap-2">
      {[1, 2, 3, 4, 5].map(
        (rating) => (
          <button
            type="button"
            key={rating}
            onClick={() =>
              onChange(
                rating
              )
            }
            className={[
              "flex h-11 w-11 items-center justify-center rounded-full border text-sm font-semibold transition",
              value === rating
                ? "border-[#2F80ED] bg-blue-50 text-[#2F80ED]"
                : "border-slate-200 text-slate-500 hover:border-blue-300",
            ].join(" ")}
          >
            {rating}
          </button>
        )
      )}
    </div>
  );
}

export default function FeedbackPage() {
  const navigate =
    useNavigate();

  const queryClient =
    useQueryClient();

  const {
    sessionId,
  } = useParams<{
    sessionId: string;
  }>();

  const [
    overallRating,
    setOverallRating,
  ] = useState<
    number | null
  >(null);

  const [
    trainerRating,
    setTrainerRating,
  ] = useState<
    number | null
  >(null);

  const [
    difficulty,
    setDifficulty,
  ] = useState<
    DifficultyRating | null
  >(null);

  const [
    energy,
    setEnergy,
  ] = useState<
    EnergyRating | null
  >(null);

  const [
    recommend,
    setRecommend,
  ] = useState<
    boolean | null
  >(null);

  const [
    comments,
    setComments,
  ] = useState("");

  // ---------------------------------------------------------
  // Session
  // ---------------------------------------------------------

  const sessionQuery =
    useQuery({
      queryKey: [
        "member-session",
        sessionId,
      ],

      queryFn: () =>
        getMemberSessionDetail(
          sessionId!
        ),

      enabled:
        !!sessionId,
    });

  // ---------------------------------------------------------
  // Submit
  // ---------------------------------------------------------

  const feedbackMutation =
    useMutation({
      mutationFn:
        submitFeedback,

      onSuccess:
        async () => {
          await queryClient.invalidateQueries({
            queryKey: [
              "member-session",
              sessionId,
            ],
          });

          if (sessionId) {
            navigate(
              `/session/${sessionId}`
            );
          } else {
            navigate(
              "/schedule"
            );
          }
        },
    });

  // ---------------------------------------------------------
  // Loading
  // ---------------------------------------------------------

  if (
    sessionQuery.isLoading
  ) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <p className="text-slate-500">
          Loading session...
        </p>
      </div>
    );
  }

  // ---------------------------------------------------------
  // Error
  // ---------------------------------------------------------

  if (
    sessionQuery.isError ||
    !sessionQuery.data
  ) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="max-w-md text-center">
          <div className="text-2xl font-bold text-[#12395B]">
            Club
            <span className="text-[#2F80ED]">
              100
            </span>
          </div>

          <h1 className="mt-6 text-2xl font-bold text-slate-900">
            Feedback unavailable
          </h1>

          <p className="mt-2 text-slate-500">
            We couldn&apos;t load this session.
          </p>

          <button
            type="button"
            onClick={() =>
              navigate(
                "/schedule"
              )
            }
            className="mt-6 rounded-xl bg-[#2F80ED] px-5 py-3 font-semibold text-white"
          >
            Back to Schedule
          </button>
        </div>
      </div>
    );
  }

  const session =
    sessionQuery.data.session;

  // ---------------------------------------------------------
  // Feedback only for Completed sessions
  // ---------------------------------------------------------

  if (
    session.status !==
    "Completed"
  ) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="max-w-md text-center">
          <div className="text-2xl font-bold text-[#12395B]">
            Club
            <span className="text-[#2F80ED]">
              100
            </span>
          </div>

          <h1 className="mt-6 text-2xl font-bold text-slate-900">
            Feedback isn&apos;t available yet
          </h1>

          <p className="mt-2 text-slate-500">
            You can share feedback after the session has been completed.
          </p>

          <button
            type="button"
            onClick={() =>
              navigate(
                `/session/${session.id}`
              )
            }
            className="mt-6 rounded-xl bg-[#2F80ED] px-5 py-3 font-semibold text-white"
          >
            Back to Session
          </button>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------
  // Already submitted
  // ---------------------------------------------------------

  if (
    session.feedback.submitted
  ) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-sm">
          <div className="text-2xl font-bold text-[#12395B]">
            Club
            <span className="text-[#2F80ED]">
              100
            </span>
          </div>

          <div className="mx-auto mt-6 flex h-14 w-14 items-center justify-center rounded-full bg-green-50 text-xl font-bold text-green-600">
            ✓
          </div>

          <h1 className="mt-5 text-2xl font-bold text-slate-900">
            Feedback submitted
          </h1>

          <p className="mt-2 text-slate-500">
            Thanks for sharing your feedback about this session.
          </p>

          <button
            type="button"
            onClick={() =>
              navigate(
                `/session/${session.id}`
              )
            }
            className="mt-6 w-full rounded-xl bg-[#2F80ED] px-5 py-3 font-semibold text-white"
          >
            Back to Session
          </button>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------
  // Validation
  // ---------------------------------------------------------

  const isComplete =
    overallRating !== null &&
    trainerRating !== null &&
    difficulty !== null &&
    energy !== null &&
    recommend !== null;

  const handleSubmit = () => {
    if (
      !sessionId ||
      !isComplete ||
      overallRating === null ||
      trainerRating === null ||
      difficulty === null ||
      energy === null ||
      recommend === null
    ) {
      return;
    }

    feedbackMutation.mutate({
      sessionId,

      overallRating,

      difficultyRating:
        difficulty,

      trainerRating,

      energyAfterSession:
        energy,

      wouldRecommend:
        recommend,

      comments,
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8">
      <div className="mx-auto w-full max-w-xl">
        {/* Header */}

        <div className="text-center">
          <button
            type="button"
            onClick={() =>
              navigate(
                `/session/${session.id}`
              )
            }
            className="text-2xl font-bold text-[#12395B]"
          >
            Club
            <span className="text-[#2F80ED]">
              100
            </span>
          </button>

          <h1 className="mt-6 text-3xl font-bold text-slate-900">
            Session Complete
          </h1>

          <p className="mt-2 text-slate-600">
            Great work. Tell us how the session went.
          </p>
        </div>

        {/* Session context */}

        <section className="mt-8 rounded-2xl bg-[#12395B] p-5 text-white">
          <p className="text-xs font-semibold uppercase tracking-wide text-blue-200">
            {
              formatDate(
                session.sessionDate
              )
            }
          </p>

          <h2 className="mt-2 text-xl font-bold">
            {
              session.program
                .name
            }
          </h2>

          <p className="mt-1 text-sm text-slate-300">
            Trainer:{" "}
            {
              session.trainer
                ?.name ??
              "Club100 Trainer"
            }
          </p>
        </section>

        <div className="mt-6 space-y-6">
          {/* Overall */}

          <section className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">
              How was today&apos;s session?
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              1 = Poor, 5 = Excellent
            </p>

            <RatingButtons
              value={
                overallRating
              }
              onChange={
                setOverallRating
              }
            />
          </section>

          {/* Difficulty */}

          <section className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">
              How difficult was the session?
            </h2>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {[
                "Too Easy",
                "Just Right",
                "Challenging",
                "Too Difficult",
              ].map(
                (
                  option
                ) => (
                  <button
                    type="button"
                    key={
                      option
                    }
                    onClick={() =>
                      setDifficulty(
                        option as DifficultyRating
                      )
                    }
                    className={[
                      "rounded-xl border px-4 py-3 text-sm font-medium transition",
                      difficulty ===
                      option
                        ? "border-[#2F80ED] bg-blue-50 text-[#2F80ED]"
                        : "border-slate-200 text-slate-600",
                    ].join(
                      " "
                    )}
                  >
                    {
                      option
                    }
                  </button>
                )
              )}
            </div>
          </section>

          {/* Energy */}

          <section className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">
              How is your energy after the session?
            </h2>

            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                "Low",
                "Same",
                "Better",
                "Excellent",
              ].map(
                (
                  option
                ) => (
                  <button
                    type="button"
                    key={
                      option
                    }
                    onClick={() =>
                      setEnergy(
                        option as EnergyRating
                      )
                    }
                    className={[
                      "rounded-xl border px-3 py-3 text-sm font-medium transition",
                      energy ===
                      option
                        ? "border-[#2F80ED] bg-blue-50 text-[#2F80ED]"
                        : "border-slate-200 text-slate-600",
                    ].join(
                      " "
                    )}
                  >
                    {
                      option
                    }
                  </button>
                )
              )}
            </div>
          </section>

          {/* Trainer */}

          <section className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">
              How would you rate{" "}
              {session.trainer
                ?.name ??
                "your trainer"}
              ?
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              1 = Poor, 5 = Excellent
            </p>

            <RatingButtons
              value={
                trainerRating
              }
              onChange={
                setTrainerRating
              }
            />
          </section>

          {/* Recommend */}

          <section className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">
              Would you recommend this session?
            </h2>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() =>
                  setRecommend(
                    true
                  )
                }
                className={[
                  "rounded-xl border px-4 py-3 font-semibold transition",
                  recommend ===
                  true
                    ? "border-[#2F80ED] bg-blue-50 text-[#2F80ED]"
                    : "border-slate-200 text-slate-600",
                ].join(
                  " "
                )}
              >
                Yes
              </button>

              <button
                type="button"
                onClick={() =>
                  setRecommend(
                    false
                  )
                }
                className={[
                  "rounded-xl border px-4 py-3 font-semibold transition",
                  recommend ===
                  false
                    ? "border-[#2F80ED] bg-blue-50 text-[#2F80ED]"
                    : "border-slate-200 text-slate-600",
                ].join(
                  " "
                )}
              >
                No
              </button>
            </div>
          </section>

          {/* Comments */}

          <section className="rounded-2xl bg-white p-6 shadow-sm">
            <label className="text-lg font-semibold text-slate-900">
              Anything else you&apos;d like to share?
            </label>

            <p className="mt-1 text-sm text-slate-500">
              Optional
            </p>

            <textarea
              value={
                comments
              }
              onChange={(
                event
              ) =>
                setComments(
                  event.target.value
                )
              }
              rows={4}
              placeholder="Tell us what worked well or what we could improve."
              className="mt-4 w-full resize-none rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-[#2F80ED]"
            />
          </section>

          {/* Missing fields */}

          {!isComplete && (
            <p className="text-center text-sm text-slate-500">
              Please answer all questions before submitting.
            </p>
          )}

          {/* Error */}

          {feedbackMutation.isError && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {feedbackMutation.error instanceof
              Error
                ? feedbackMutation.error
                    .message
                : "We couldn't submit your feedback. Please try again."}
            </div>
          )}

          {/* Submit */}

          <button
            type="button"
            onClick={
              handleSubmit
            }
            disabled={
              feedbackMutation.isPending ||
              !isComplete
            }
            className="w-full rounded-xl bg-[#2F80ED] px-5 py-4 text-base font-semibold text-white transition hover:bg-[#1F6FD1] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {feedbackMutation.isPending
              ? "Submitting..."
              : "Submit Feedback"}
          </button>

          <button
            type="button"
            onClick={() =>
              navigate(
                `/session/${session.id}`
              )
            }
            className="w-full pb-4 text-sm font-semibold text-slate-500"
          >
            Back to Session
          </button>
        </div>
      </div>
    </div>
  );
}