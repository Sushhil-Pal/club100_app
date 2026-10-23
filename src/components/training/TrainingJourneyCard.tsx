import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  changeMyTrainingLevel,
  getMyTrainingJourney,
  type TrainingLevelCode,
} from "../../services/trainingJourneyService";

const LEVELS: { code: TrainingLevelCode; name: string }[] = [
  { code: "L1", name: "Core" },
  { code: "L2", name: "Strong" },
  { code: "L3", name: "Performance" },
];

export default function TrainingJourneyCard({
  enrollmentId,
  programId,
}: {
  enrollmentId: string;
  programId: string;
}) {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [selection, setSelection] = useState<TrainingLevelCode | null>(null);
  const [error, setError] = useState<string | null>(null);

  const journeyQuery = useQuery({
    queryKey: ["member-training-journey"],
    queryFn: getMyTrainingJourney,
  });

  const mutation = useMutation({
    mutationFn: (levelCode: TrainingLevelCode) => {
      const journey = journeyQuery.data?.journey;
      if (!journey) throw new Error("Training journey is unavailable. Refresh the page.");
      return changeMyTrainingLevel(levelCode, journey.modified, enrollmentId);
    },
    onSuccess: async () => {
      setEditing(false);
      setSelection(null);
      setError(null);
      // The next Self workout, its curriculum, and the journey must all refresh.
      await queryClient.invalidateQueries();
    },
    onError: (reason: unknown) => {
      setError(reason instanceof Error ? reason.message : "Could not change your level. Refresh and retry.");
    },
  });

  if (journeyQuery.isPending) {
    return <section className="rounded-2xl bg-white p-6 shadow-sm" aria-busy="true">Loading your Training Journey…</section>;
  }

  if (journeyQuery.isError) {
    return <section className="rounded-2xl border border-red-200 bg-white p-6 shadow-sm" role="alert">Unable to load Training Journey. Please refresh.</section>;
  }

  const journey = journeyQuery.data?.journey;
  if (!journey) {
    return <section className="rounded-2xl bg-white p-6 shadow-sm"><h2 className="text-xl font-semibold text-slate-900">My Training Journey</h2><p className="mt-2 text-sm text-slate-600">Your training journey is not yet available. Please contact Club100 support.</p></section>;
  }

  if (journey.program !== programId || journey.track !== "Standard") {
    return <section className="rounded-2xl border border-amber-200 bg-white p-6 shadow-sm"><h2 className="text-xl font-semibold text-slate-900">My Training Journey</h2><p className="mt-2 text-sm text-slate-600">Your training journey is linked to another program. Contact Club100 support before changing levels.</p></section>;
  }

  const chosen = selection ?? journey.levelCode;

  return (
    <section className="rounded-2xl bg-white p-6 shadow-sm" aria-label="My Training Journey">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">My Training Journey</h2>
          <p className="mt-1 text-sm text-slate-500">Your level and position in the repeating 12-week program.</p>
        </div>
        <span className="rounded-full bg-blue-50 px-3 py-1 text-sm font-semibold text-[#12395B]">
          {journey.levelName || LEVELS.find(level => level.code === journey.levelCode)?.name} · {journey.levelCode}
        </span>
      </div>

      <div className="mt-5 grid grid-cols-3 gap-3">
        <div className="rounded-xl bg-slate-50 p-3"><p className="text-xs text-slate-500">Cycle</p><p className="mt-1 text-lg font-bold text-[#12395B]">{journey.cycleNumber}</p></div>
        <div className="rounded-xl bg-slate-50 p-3"><p className="text-xs text-slate-500">Week</p><p className="mt-1 text-lg font-bold text-[#12395B]">{journey.weekNumber}</p></div>
        <div className="rounded-xl bg-slate-50 p-3"><p className="text-xs text-slate-500">Next session</p><p className="mt-1 text-lg font-bold text-[#12395B]">{journey.sessionNumber}</p></div>
      </div>
      {journey.nextWorkoutAt && (
        <p className="mt-3 text-sm text-slate-600">Next workout: {new Date(journey.nextWorkoutAt).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}</p>
      )}

      {!editing ? (
        <button type="button" className="mt-5 rounded-xl bg-[#2F80ED] px-5 py-3 text-sm font-semibold text-white hover:bg-[#2266ba]" onClick={() => { setSelection(journey.levelCode); setError(null); setEditing(true); }}>
          Change Training Level
        </button>
      ) : (
        <div className="mt-5 rounded-xl border border-slate-200 p-4">
          <p className="font-semibold text-slate-900">Choose your training level</p>
          <p className="mt-1 text-sm text-slate-600">Changing difficulty will not restart your week or session. Your next scheduled workout uses the new level.</p>
          <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="Training level">
            {LEVELS.map(level => (
              <button type="button" key={level.code} aria-pressed={chosen === level.code} disabled={mutation.isPending} onClick={() => { setSelection(level.code); setError(null); }} className={`rounded-xl border px-4 py-2 text-sm font-semibold ${chosen === level.code ? "border-[#2F80ED] bg-blue-50 text-[#12395B]" : "border-slate-200 text-slate-700"}`}>
                {level.name}
              </button>
            ))}
          </div>
          {error && <p className="mt-3 text-sm text-red-700" role="alert">{error}</p>}
          <div className="mt-4 flex gap-3">
            <button type="button" disabled={mutation.isPending || chosen === journey.levelCode} className="rounded-xl bg-[#2F80ED] px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50" onClick={() => { if (window.confirm(`Change training level to ${LEVELS.find(level => level.code === chosen)?.name}? Your curriculum position will stay the same.`)) mutation.mutate(chosen); }}>
              {mutation.isPending ? "Saving…" : "Confirm Change"}
            </button>
            <button type="button" disabled={mutation.isPending} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700" onClick={() => { setEditing(false); setSelection(null); setError(null); }}>Cancel</button>
          </div>
        </div>
      )}
    </section>
  );
}
