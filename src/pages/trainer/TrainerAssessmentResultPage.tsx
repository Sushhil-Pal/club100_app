import {
  useParams,
} from "react-router-dom";

export default function TrainerAssessmentResultPage() {
  const {
    assessmentId,
  } = useParams<{
    assessmentId: string;
  }>();

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">
        Assessment Complete
      </h1>

      <p className="mt-2 text-sm text-slate-500">
        Assessment ID: {assessmentId}
      </p>

      <div className="mt-6 rounded-2xl bg-white p-6 shadow-sm">
        Assessment result summary coming next.
      </div>
    </div>
  );
}