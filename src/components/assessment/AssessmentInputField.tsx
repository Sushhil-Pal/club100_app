import {
  useEffect,
  useState,
} from "react";

import type {
  MemberSelfAssessmentInput,
} from "../../services/memberService";

export type AssessmentInputState = {
  value: string;
  textValue: string;
};

export function isAssessmentInputEmpty(
  input: MemberSelfAssessmentInput,
  state: AssessmentInputState | undefined
) {
  if (!state) {
    return true;
  }

  if (
    input.resultType === "Select" ||
    input.resultType === "Text" ||
    input.resultType === "Yes/No"
  ) {
    return !state.textValue.trim();
  }

  return state.value === "";
}

function DurationInput({
  value,
  onChange,
  showValidationError,
  unit,
}: {
  value: string;
  onChange: (value: string) => void;
  showValidationError: boolean;
  unit: string | null;
}) {
  const [running, setRunning] =
    useState(false);

  useEffect(() => {
    if (!running) {
      return;
    }

    const timer = window.setInterval(
      () => {
        const current =
          Number(value || 0);

        onChange(
          String(current + 1)
        );
      },
      1000
    );

    return () => {
      window.clearInterval(timer);
    };
  }, [running, value, onChange]);

  const captured =
    value !== "" && Number(value) >= 0;

  return (
    <div className="mt-3">
      <div
        className={[
          "rounded-2xl border p-3 sm:p-4",
          showValidationError
            ? "border-amber-300 bg-amber-50"
            : "border-slate-200 bg-slate-50",
        ].join(" ")}
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Timer
            </p>
            <p className="mt-1 text-2xl font-bold tabular-nums text-[#12395B] sm:text-3xl">
              {value || "0"}
              <span className="ml-1 text-sm font-medium text-slate-500">
                {unit || "seconds"}
              </span>
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:flex">
            <button
              type="button"
              onClick={() =>
                setRunning(
                  (current) => !current
                )
              }
              className="w-full rounded-xl bg-[#2F80ED] px-4 py-2 text-sm font-semibold text-white sm:w-auto"
            >
              {running ? "Stop" : "Start"}
            </button>

            <button
              type="button"
              disabled={running}
              onClick={() =>
                onChange("")
              }
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 disabled:opacity-50 sm:w-auto"
            >
              Reset
            </button>
          </div>
        </div>

        {!running && captured && (
          <p className="mt-3 text-xs font-medium text-emerald-700">
            Result captured: {value} {unit || "seconds"}
          </p>
        )}

        <div className="mt-3">
          <label className="text-xs font-medium text-slate-500">
            Or adjust the result manually
          </label>
          <input
            type="number"
            min="0"
            step="1"
            value={value}
            onChange={(event) =>
              onChange(
                event.target.value
              )
            }
            className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-[#2F80ED]"
          />
        </div>
      </div>
    </div>
  );
}

export default function AssessmentInputField({
  input,
  state,
  onChange,
  showValidation = false,
  embedded = false,
  hideRequirementIndicator = false,
  hideEquipment = false,
}: {
  input: MemberSelfAssessmentInput;
  state: AssessmentInputState;
  onChange: (
    next: AssessmentInputState
  ) => void;
  showValidation?: boolean;
  embedded?: boolean;
  hideRequirementIndicator?: boolean;
  hideEquipment?: boolean;
}) {
  const isMissing =
    input.required &&
    isAssessmentInputEmpty(
      input,
      state
    );

  const showValidationError =
    showValidation && isMissing;

  const options =
    (input.options ?? "")
      .split("\n")
      .map((item) =>
        item.trim()
      )
      .filter(Boolean);

  const fieldClassName = [
    "mt-2 w-full rounded-xl border px-4 py-3 outline-none transition",
    showValidationError
      ? "border-amber-400 bg-amber-50"
      : "border-slate-300 bg-white",
    "focus:border-[#2F80ED]",
  ].join(" ");

  return (
    <div
      className={
        embedded
          ? ""
          : "rounded-2xl border border-slate-200 p-3 sm:p-4"
      }
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <label className="text-sm font-semibold text-slate-800">
              {input.inputName}
              {input.required &&
                !hideRequirementIndicator && (
                  <span className="ml-1 text-red-500">
                    *
                  </span>
                )}
            </label>

            {!input.required &&
              !hideRequirementIndicator && (
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-500">
                  Optional
                </span>
              )}
          </div>

          {input.description && (
            <p className="mt-1 text-sm text-slate-600">
              {input.description}
            </p>
          )}
        </div>

        {!hideEquipment &&
          input.equipmentRequired &&
          input.equipmentRequired !== "None" && (
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
              {input.equipmentRequired}
            </span>
          )}
      </div>

      {input.instructions && (
        <details className="mt-3 rounded-xl bg-blue-50 text-[#12395B]">
          <summary className="cursor-pointer select-none px-3 py-2.5 text-sm font-semibold">
            How to do this
          </summary>
          <div className="whitespace-pre-line border-t border-blue-100 px-3 py-3 text-sm leading-6">
            {input.instructions}
          </div>
        </details>
      )}

      {input.resultType === "Duration" ? (
        <DurationInput
          value={state.value}
          onChange={(value) =>
            onChange({
              ...state,
              value,
            })
          }
          showValidationError={showValidationError}
          unit={input.unit}
        />
      ) : input.resultType === "Rating" ? (
        <div className="mt-3 grid grid-cols-5 gap-2 lg:grid-cols-10">
          {options.map((option) => {
            const selected =
              state.value === option;

            return (
              <button
                key={option}
                type="button"
                onClick={() =>
                  onChange({
                    ...state,
                    value: option,
                  })
                }
                className={[
                  "rounded-xl border px-2 py-3 text-sm font-semibold transition",
                  selected
                    ? "border-[#2F80ED] bg-[#2F80ED] text-white"
                    : showValidationError
                      ? "border-amber-400 bg-amber-50 text-slate-700"
                      : "border-slate-300 bg-white text-slate-700 hover:border-[#2F80ED]",
                ].join(" ")}
              >
                {option}
              </button>
            );
          })}
        </div>
      ) : input.resultType === "Select" ||
        input.resultType === "Yes/No" ? (
        <select
          value={state.textValue}
          onChange={(event) =>
            onChange({
              ...state,
              textValue:
                event.target.value,
            })
          }
          className={fieldClassName}
        >
          <option value="">
            Select
          </option>
          {(input.resultType === "Yes/No"
            ? ["Yes", "No"]
            : options
          ).map((option) => (
            <option
              key={option}
              value={option}
            >
              {option}
            </option>
          ))}
        </select>
      ) : input.resultType === "Text" ? (
        <textarea
          value={state.textValue}
          onChange={(event) =>
            onChange({
              ...state,
              textValue:
                event.target.value,
            })
          }
          rows={3}
          className={fieldClassName}
        />
      ) : (
        <div className="mt-2 flex items-center gap-2">
          <input
            type="number"
            min={
              input.resultType === "Count"
                ? "0"
                : undefined
            }
            step={
              input.resultType === "Count"
                ? "1"
                : "any"
            }
            value={state.value}
            onChange={(event) =>
              onChange({
                ...state,
                value:
                  event.target.value,
              })
            }
            className={fieldClassName.replace("mt-2 ", "")}
          />

          {input.unit && (
            <span className="shrink-0 text-sm text-slate-500">
              {input.unit}
            </span>
          )}
        </div>
      )}

      {showValidationError && (
        <p className="mt-2 text-xs font-medium text-amber-700">
          Required to complete the assessment
        </p>
      )}
    </div>
  );
}
