import { useState } from "react";
import {
  useMutation,
} from "@tanstack/react-query";
import {
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  submitFeedback,
} from "../services/feedbackService";

export default function FeedbackPage() {
  const navigate = useNavigate();

  const { sessionId } = useParams();

  const [overallRating, setOverallRating] =
    useState(4);

  const [trainerRating, setTrainerRating] =
    useState(5);

  const [difficulty, setDifficulty] =
    useState<
      | "Too Easy"
      | "Just Right"
      | "Challenging"
      | "Too Difficult"
    >("Just Right");

  const [energy, setEnergy] =
    useState<
      | "Low"
      | "Same"
      | "Better"
      | "Excellent"
    >("Better");

  const [recommend, setRecommend] =
    useState(true);

  const [comments, setComments] =
    useState("");

  const feedbackMutation = useMutation({
    mutationFn: submitFeedback,

    onSuccess: () => {
      navigate("/dashboard");
    },
  });

  const handleSubmit = () => {
    if (!sessionId) return;

    feedbackMutation.mutate({
      sessionId,
      overallRating,
      difficultyRating: difficulty,
      trainerRating,
      energyAfterSession: energy,
      wouldRecommend: recommend,
      comments,
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8">
      <div className="mx-auto w-full max-w-xl">
        <div className="text-center">
          <div className="text-2xl font-bold text-[#12395B]">
            Club
            <span className="text-[#2F80ED]">
              100
            </span>
          </div>

          <h1 className="mt-6 text-3xl font-bold text-slate-900">
            Session Complete
          </h1>

          <p className="mt-2 text-slate-600">
            Great work. Tell us how the
            session went.
          </p>
        </div>

        <div className="mt-8 space-y-6">
          <section className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">
              How was today&apos;s session?
            </h2>

            <div className="mt-5 flex gap-2">
              {[1, 2, 3, 4, 5].map(
                (rating) => (
                  <button
                    key={rating}
                    onClick={() =>
                      setOverallRating(
                        rating
                      )
                    }
                    className={[
                      "flex h-11 w-11 items-center justify-center rounded-full border text-sm font-semibold",
                      overallRating >=
                      rating
                        ? "border-[#2F80ED] bg-blue-50 text-[#2F80ED]"
                        : "border-slate-200 text-slate-400",
                    ].join(" ")}
                  >
                    {rating}
                  </button>
                )
              )}
            </div>
          </section>

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
              ].map((option) => (
                <button
                  key={option}
                  onClick={() =>
                    setDifficulty(
                      option as typeof difficulty
                    )
                  }
                  className={[
                    "rounded-xl border px-4 py-3 text-sm font-medium",
                    difficulty === option
                      ? "border-[#2F80ED] bg-blue-50 text-[#2F80ED]"
                      : "border-slate-200 text-slate-600",
                  ].join(" ")}
                >
                  {option}
                </button>
              ))}
            </div>
          </section>

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
              ].map((option) => (
                <button
                  key={option}
                  onClick={() =>
                    setEnergy(
                      option as typeof energy
                    )
                  }
                  className={[
                    "rounded-xl border px-3 py-3 text-sm font-medium",
                    energy === option
                      ? "border-[#2F80ED] bg-blue-50 text-[#2F80ED]"
                      : "border-slate-200 text-slate-600",
                  ].join(" ")}
                >
                  {option}
                </button>
              ))}
            </div>
          </section>

          <section className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">
              How would you rate the trainer?
            </h2>

            <div className="mt-5 flex gap-2">
              {[1, 2, 3, 4, 5].map(
                (rating) => (
                  <button
                    key={rating}
                    onClick={() =>
                      setTrainerRating(
                        rating
                      )
                    }
                    className={[
                      "flex h-11 w-11 items-center justify-center rounded-full border text-sm font-semibold",
                      trainerRating >=
                      rating
                        ? "border-[#2F80ED] bg-blue-50 text-[#2F80ED]"
                        : "border-slate-200 text-slate-400",
                    ].join(" ")}
                  >
                    {rating}
                  </button>
                )
              )}
            </div>
          </section>

          <section className="rounded-2xl bg-white p-6 shadow-sm">
            <label className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  Would you recommend this
                  session?
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  This helps us improve
                  Club100 sessions.
                </p>
              </div>

              <input
                type="checkbox"
                checked={recommend}
                onChange={(event) =>
                  setRecommend(
                    event.target.checked
                  )
                }
                className="h-5 w-5 accent-[#2F80ED]"
              />
            </label>
          </section>

          <section className="rounded-2xl bg-white p-6 shadow-sm">
            <label className="text-lg font-semibold text-slate-900">
              Anything else you&apos;d like
              to share?
            </label>

            <textarea
              value={comments}
              onChange={(event) =>
                setComments(
                  event.target.value
                )
              }
              rows={4}
              placeholder="Optional comments"
              className="mt-4 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-[#2F80ED]"
            />
          </section>

          {feedbackMutation.isError && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              We couldn&apos;t submit your
              feedback. Please try again.
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={
              feedbackMutation.isPending ||
              !sessionId
            }
            className="w-full rounded-xl bg-[#2F80ED] px-5 py-4 text-base font-semibold text-white hover:bg-[#1F6FD1] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {feedbackMutation.isPending
              ? "Submitting..."
              : "Submit Feedback"}
          </button>
        </div>
      </div>
    </div>
  );
}