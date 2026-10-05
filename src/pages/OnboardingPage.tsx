import { useState } from "react";
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  Navigate,
  useNavigate,
} from "react-router-dom";

import PageContainer from "../components/layout/PageContainer";

import {
  completeOnboarding,
  getCurrentMember,
} from "../services/memberService";

export default function OnboardingPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const memberQuery = useQuery({
    queryKey: ["current-member"],
    queryFn: getCurrentMember,
  });

  const [dateOfBirth, setDateOfBirth] =
    useState("");

  const [gender, setGender] =
    useState("");

  const [fitnessGoals, setFitnessGoals] =
    useState<string[]>([]);

  const [
    currentFitnessLevel,
    setCurrentFitnessLevel,
  ] = useState("");

  const [
    preferredDeliveryMode,
    setPreferredDeliveryMode,
  ] = useState("");

  const [
    medicalNotes,
    setMedicalNotes,
  ] = useState("");

  const [formError, setFormError] =
    useState("");

  const fitnessGoalOptions = [
    "Improve Strength",
    "Improve Mobility",
    "Improve Endurance",
    "Weight Management",
    "General Fitness",
    "Healthy Aging",
    "Sports Performance",
    "Other",
  ];

  const toggleFitnessGoal = (
    goal: string
  ) => {
    setFitnessGoals(
      (current) =>
        current.includes(goal)
          ? current.filter(
              (item) =>
                item !== goal
            )
          : [
              ...current,
              goal,
            ]
    );
  };

  const onboardingMutation = useMutation({
    mutationFn: completeOnboarding,

    onSuccess: (response) => {
      queryClient.setQueryData(
        ["current-member"],
        (old: any) => ({
          ...old,
          ...response.member,
        })
      );

      navigate(
        "/dashboard",
        {
          replace: true,
        }
      );
    },
  });

  if (memberQuery.isLoading) {
    return (
      <PageContainer>
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <p className="text-slate-500">
            Loading your profile...
          </p>
        </div>
      </PageContainer>
    );
  }

  if (
    memberQuery.isError ||
    !memberQuery.data
  ) {
    return (
      <PageContainer>
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <p className="font-medium text-red-600">
            We couldn&apos;t load your profile.
          </p>
        </div>
      </PageContainer>
    );
  }

  const member = memberQuery.data;

  if (
    member.onboardingStatus ===
    "Completed"
  ) {
    return (
      <Navigate
        to="/dashboard"
        replace
      />
    );
  }

  const handleSubmit = (
    event: React.FormEvent
  ) => {
    event.preventDefault();

    setFormError("");

    if (!dateOfBirth) {
      setFormError(
        "Please enter your date of birth."
      );
      return;
    }

    if (!gender) {
      setFormError(
        "Please select your gender."
      );
      return;
    }

    if (fitnessGoals.length === 0) {
      setFormError(
        "Please select at least one fitness goal."
      );
      return;
    }

    if (!currentFitnessLevel) {
      setFormError(
        "Please select your current fitness level."
      );
      return;
    }

    if (!preferredDeliveryMode) {
      setFormError(
        "Please select your preferred delivery mode."
      );
      return;
    }

    onboardingMutation.mutate({
      dateOfBirth,
      gender,
      fitnessGoals,
      currentFitnessLevel,
      preferredDeliveryMode,
      medicalNotes,
    });
  };

  return (
    <PageContainer>
      <div className="mx-auto max-w-2xl">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-[#2F80ED]">
            Welcome to Club100
          </p>

          <h1 className="mt-2 text-3xl font-bold text-[#12395B] md:text-4xl">
            Tell us a little about yourself
          </h1>

          <p className="mt-3 text-slate-600">
            This helps us understand your starting point and prepare the
            right Club100 experience for you.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="mt-8 rounded-2xl bg-white p-6 shadow-sm"
        >
          <div className="mb-6 rounded-xl bg-blue-50 p-4">
            <p className="font-medium text-[#12395B]">
              Hi {member.fullName.split(" ")[0]}
            </p>

            <p className="mt-1 text-sm text-slate-600">
              Your Club100 account is ready. Complete these details to
              finish setting up your profile.
            </p>
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700">
              Date of Birth
            </label>

            <input
              type="date"
              value={dateOfBirth}
              onChange={(event) =>
                setDateOfBirth(
                  event.target.value
                )
              }
              className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-[#2F80ED]"
            />
          </div>

          <div className="mt-5">
            <label className="text-sm font-medium text-slate-700">
              Gender
            </label>

            <select
              value={gender}
              onChange={(event) =>
                setGender(
                  event.target.value
                )
              }
              className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-[#2F80ED]"
            >
              <option value="">
                Select gender
              </option>

              <option value="Male">
                Male
              </option>

              <option value="Female">
                Female
              </option>

              <option value="Other">
                Other
              </option>

              <option value="Prefer not to say">
                Prefer not to say
              </option>
            </select>
          </div>

          <div className="mt-5">
            <label className="text-sm font-medium text-slate-700">
              Primary Fitness Goals
            </label>

            <p className="mt-1 text-xs text-slate-500">
              Select all that apply.
            </p>

            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {fitnessGoalOptions.map(
                (goal) => {
                  const selected =
                    fitnessGoals.includes(
                      goal
                    );

                  return (
                    <button
                      key={goal}
                      type="button"
                      onClick={() =>
                        toggleFitnessGoal(
                          goal
                        )
                      }
                      className={`rounded-xl border px-4 py-3 text-left text-sm font-medium transition ${
                        selected
                          ? "border-[#2F80ED] bg-blue-50 text-[#12395B]"
                          : "border-slate-300 bg-white text-slate-700 hover:border-[#2F80ED]"
                      }`}
                    >
                      <span className="flex items-center gap-3">
                        <span
                          className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border ${
                            selected
                              ? "border-[#2F80ED] bg-[#2F80ED] text-white"
                              : "border-slate-300"
                          }`}
                        >
                          {selected
                            ? "✓"
                            : ""}
                        </span>

                        {goal}
                      </span>
                    </button>
                  );
                }
              )}
            </div>
          </div>

          <div className="mt-5">
            <label className="text-sm font-medium text-slate-700">
              Current Fitness Level
            </label>

            <select
              value={currentFitnessLevel}
              onChange={(event) =>
                setCurrentFitnessLevel(
                  event.target.value
                )
              }
              className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-[#2F80ED]"
            >
              <option value="">
                Select fitness level
              </option>

              <option value="Beginner">
                Beginner
              </option>

              <option value="Intermediate">
                Intermediate
              </option>

              <option value="Advanced">
                Advanced
              </option>
            </select>
          </div>

          <div className="mt-5">
            <label className="text-sm font-medium text-slate-700">
              Preferred Delivery Mode
            </label>

            <select
              value={preferredDeliveryMode}
              onChange={(event) =>
                setPreferredDeliveryMode(
                  event.target.value
                )
              }
              className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-[#2F80ED]"
            >
              <option value="">
                Select delivery mode
              </option>

              <option value="Online">
                Online
              </option>

              <option value="Onsite">
                Onsite
              </option>

              <option value="Hybrid">
                Hybrid
              </option>
            </select>
          </div>

          <div className="mt-5">
            <label className="text-sm font-medium text-slate-700">
              Medical / Physical Notes
            </label>

            <textarea
              value={medicalNotes}
              onChange={(event) =>
                setMedicalNotes(
                  event.target.value
                )
              }
              rows={4}
              placeholder="Tell us about any injuries, medical conditions, movement limitations, or anything your trainer should know. Optional."
              className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-[#2F80ED]"
            />

            <p className="mt-2 text-xs leading-5 text-slate-500">
              Optional. This information helps Club100 trainers plan
              appropriate sessions for you.
            </p>
          </div>

          {formError && (
            <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {formError}
            </div>
          )}

          {onboardingMutation.isError && (
            <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              We couldn&apos;t save your profile. Please try again.
            </div>
          )}

          <button
            type="submit"
            disabled={
              onboardingMutation.isPending
            }
            className="mt-6 w-full rounded-xl bg-[#2F80ED] px-4 py-3 font-semibold text-white transition hover:bg-[#1F6FD1] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {onboardingMutation.isPending
              ? "Saving..."
              : "Complete Setup"}
          </button>
        </form>
      </div>
    </PageContainer>
  );
}