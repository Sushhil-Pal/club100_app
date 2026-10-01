import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  getTrainerAssessment,
  saveTrainerAssessment,
  type TrainerAssessmentInput,
} from "../../services/trainerService";

type InputState = {
  value: string;
  textValue: string;
};

function isInputEmpty(
  input: TrainerAssessmentInput,
  state: InputState | undefined
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

function AssessmentInputField({
  input,
  state,
  onChange,
}: {
  input: TrainerAssessmentInput;
  state: InputState;
  onChange: (
    next: InputState
  ) => void;
}) {
  const isMissing =
    input.required &&
    isInputEmpty(
      input,
      state
    );

  const label = (
    <label className="text-sm font-semibold text-slate-800">
      {input.inputName}

      {input.required && (
        <span className="ml-1 text-red-500">
          *
        </span>
      )}
    </label>
  );

  const help = (
    <>
      {input.instructions && (
        <p className="mt-1 text-xs text-slate-500">
          {input.instructions}
        </p>
      )}

      {isMissing && (
        <p className="mt-1 text-xs font-medium text-amber-700">
          Required
        </p>
      )}
    </>
  );

  const selectClassName = [
    "mt-2 w-full rounded-xl border px-4 py-3 outline-none transition",
    isMissing
      ? "border-amber-400 bg-amber-50"
      : "border-slate-300 bg-white",
    "focus:border-[#2F80ED]",
  ].join(" ");

  const numericClassName = [
    "min-w-0 flex-1 rounded-xl border px-4 py-3 outline-none transition",
    isMissing
      ? "border-amber-400 bg-amber-50"
      : "border-slate-300 bg-white",
    "focus:border-[#2F80ED]",
  ].join(" ");

  const textClassName = [
    "mt-2 w-full rounded-xl border px-4 py-3 outline-none transition",
    isMissing
      ? "border-amber-400 bg-amber-50"
      : "border-slate-300 bg-white",
    "focus:border-[#2F80ED]",
  ].join(" ");

  if (
    input.resultType === "Select" ||
    input.resultType === "Yes/No"
  ) {
    const options =
      input.resultType === "Yes/No"
        ? ["Yes", "No"]
        : (input.options ?? "")
            .split("\n")
            .map((item) =>
              item.trim()
            )
            .filter(Boolean);

    return (
      <div>
        {label}

        <select
          value={state.textValue}
          onChange={(event) =>
            onChange({
              ...state,
              textValue:
                event.target.value,
            })
          }
          className={
            selectClassName
          }
        >
          <option value="">
            Select
          </option>

          {options.map(
            (option) => (
              <option
                key={option}
                value={option}
              >
                {option}
              </option>
            )
          )}
        </select>

        {help}
      </div>
    );
  }

  if (
    input.resultType === "Text"
  ) {
    return (
      <div>
        {label}

        <textarea
          value={
            state.textValue
          }
          onChange={(event) =>
            onChange({
              ...state,
              textValue:
                event.target.value,
            })
          }
          rows={3}
          className={
            textClassName
          }
        />

        {help}
      </div>
    );
  }

  if (
    input.resultType === "Rating"
  ) {
    const options =
      (input.options ?? "")
        .split("\n")
        .map((item) =>
          item.trim()
        )
        .filter(Boolean);

    return (
      <div>
        {label}

        <select
          value={state.value}
          onChange={(event) =>
            onChange({
              ...state,
              value:
                event.target.value,
            })
          }
          className={
            selectClassName
          }
        >
          <option value="">
            Select
          </option>

          {options.map(
            (option) => (
              <option
                key={option}
                value={option}
              >
                {option}
              </option>
            )
          )}
        </select>

        {help}
      </div>
    );
  }

  return (
    <div>
      {label}

      <div className="mt-2 flex items-center gap-2">
        <input
          type="number"
          step="any"
          value={state.value}
          onChange={(event) =>
            onChange({
              ...state,
              value:
                event.target.value,
            })
          }
          className={
            numericClassName
          }
        />

        {input.unit && (
          <span className="shrink-0 text-sm text-slate-500">
            {input.unit}
          </span>
        )}
      </div>

      {help}
    </div>
  );
}

export default function TrainerAssessmentPage() {
  const navigate =
    useNavigate();

  const queryClient =
    useQueryClient();

  const {
    assessmentId,
  } = useParams<{
    assessmentId: string;
  }>();

  const [
    inputState,
    setInputState,
  ] = useState<
    Record<
      string,
      InputState
    >
  >({});

  const [
    saveMessage,
    setSaveMessage,
  ] = useState("");

  const [
    validationAttempted,
    setValidationAttempted,
  ] = useState(false);

  const assessmentQuery =
    useQuery({
      queryKey: [
        "trainer-assessment",
        assessmentId,
      ],

      queryFn: () =>
        getTrainerAssessment(
          assessmentId!
        ),

      enabled:
        !!assessmentId,
    });

  useEffect(() => {
    const inputs =
      assessmentQuery.data
        ?.assessment.inputs;

    if (!inputs) {
      return;
    }

    const initialState:
      Record<
        string,
        InputState
      > = {};

    for (
      const input of inputs
    ) {
      initialState[
        input.rowId
      ] = {
        value:
            input.hasValue
                ? String(input.value ?? 0)
                : "",

        textValue:
          input.textValue ??
          "",
      };
    }

    setInputState(
      initialState
    );
  }, [
    assessmentQuery.data,
  ]);

  const groupedInputs =
    useMemo(() => {
      const inputs =
        assessmentQuery.data
          ?.assessment.inputs ??
        [];

      return inputs.reduce<
        Record<
          string,
          TrainerAssessmentInput[]
        >
      >(
        (
          groups,
          input
        ) => {
          const category =
            input.category ||
            "Other";

          if (
            !groups[
              category
            ]
          ) {
            groups[
              category
            ] = [];
          }

          groups[
            category
          ].push(
            input
          );

          return groups;
        },
        {}
      );
    }, [
      assessmentQuery.data,
    ]);

  const missingRequiredInputs =
    useMemo(() => {
      const inputs =
        assessmentQuery.data
          ?.assessment.inputs ??
        [];

      return inputs.filter(
        (input) => {
          if (
            !input.required
          ) {
            return false;
          }

          return isInputEmpty(
            input,
            inputState[
              input.rowId
            ]
          );
        }
      );
    }, [
      assessmentQuery.data,
      inputState,
    ]);

  const saveMutation =
    useMutation({
      mutationFn: (
        status:
          | "Draft"
          | "Completed"
      ) => {
        const inputs =
          assessmentQuery.data
            ?.assessment.inputs ??
          [];

        const payload =
          inputs.map(
            (input) => {
              const state =
                inputState[
                  input.rowId
                ] ?? {
                  value: "",
                  textValue:
                    "",
                };

              return {
                rowId:
                  input.rowId,

                value:
                  state.value ===
                  ""
                    ? null
                    : Number(
                        state.value
                      ),

                textValue:
                  state.textValue ===
                  ""
                    ? null
                    : state.textValue,
              };
            }
          );

        return saveTrainerAssessment(
          assessmentId!,
          payload,
          status
        );
      },

      onSuccess: async (
        response
      ) => {
        setValidationAttempted(
          false
        );

        if (
          response
            .assessment
            .status ===
          "Completed"
        ) {
          setSaveMessage(
            "Assessment completed successfully."
          );
        } else {
          setSaveMessage(
            "Draft saved."
          );
        }

        await queryClient
          .invalidateQueries({
            queryKey: [
              "trainer-assessment",
              assessmentId,
            ],
          });

        if (
          response
            .assessment
            .status ===
          "Completed"
        ) {
          navigate(
            `/trainer/assessment/${assessmentId}/result`,
            {
              replace: true,
            }
          );
        }
      },
    });

  if (
    assessmentQuery
      .isLoading
  ) {
    return (
      <div className="rounded-2xl bg-white p-6 shadow-sm">
        Loading assessment...
      </div>
    );
  }

  if (
    assessmentQuery
      .isError ||
    !assessmentQuery.data
  ) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
        <p className="font-medium text-red-700">
          We couldn&apos;t
          load this
          assessment.
        </p>
      </div>
    );
  }

  const assessment =
    assessmentQuery.data
      .assessment;

  return (
    <div>
      {/* ============================================
          Header
      ============================================ */}

      <div className="rounded-2xl bg-white p-5 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wide text-[#2F80ED]">
          {
            assessment.assessmentType
          }{" "}
          Assessment
        </p>

        <h1 className="mt-2 text-2xl font-bold text-slate-900">
          {
            assessment.member
              .fullName
          }
        </h1>

        <div className="mt-2 flex flex-wrap gap-3 text-sm text-slate-500">
          <span>
            {
              assessment.assessmentDate
            }
          </span>

          <span>
            {
              assessment.deliveryMode
            }
          </span>

          <span>
            {
              assessment.status
            }
          </span>
        </div>
      </div>

      {/* ============================================
          Category sections
      ============================================ */}

      <div className="mt-6 space-y-6">
        {Object.entries(
          groupedInputs
        ).map(
          ([
            category,
            inputs,
          ]) => (
            <section
              key={
                category
              }
              className="rounded-2xl bg-white p-5 shadow-sm"
            >
              <div className="flex items-center justify-between gap-4">
                <h2 className="text-lg font-bold text-[#12395B]">
                  {
                    category
                  }
                </h2>

                <span className="text-xs text-slate-400">
                  {
                    inputs.filter(
                      (
                        input
                      ) =>
                        !isInputEmpty(
                          input,
                          inputState[
                            input
                              .rowId
                          ]
                        )
                    )
                      .length
                  }
                  /
                  {
                    inputs.length
                  }{" "}
                  completed
                </span>
              </div>

              <div className="mt-5 grid gap-6 md:grid-cols-2">
                {inputs.map(
                  (
                    input
                  ) => (
                    <AssessmentInputField
                      key={
                        input.rowId
                      }
                      input={
                        input
                      }
                      state={
                        inputState[
                          input
                            .rowId
                        ] ?? {
                          value:
                            "",
                          textValue:
                            "",
                        }
                      }
                      onChange={(
                        next
                      ) => {
                        setInputState(
                          (
                            current
                          ) => ({
                            ...current,

                            [
                              input
                                .rowId
                            ]:
                              next,
                          })
                        );

                        setSaveMessage(
                          ""
                        );
                      }}
                    />
                  )
                )}
              </div>
            </section>
          )
        )}
      </div>

      {/* ============================================
          Frontend validation
      ============================================ */}

      {validationAttempted &&
        missingRequiredInputs.length >
          0 && (
          <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-5">
            <p className="font-semibold text-amber-900">
              Complete the
              required fields
              before finishing
              the assessment.
            </p>

            <p className="mt-1 text-sm text-amber-700">
              {
                missingRequiredInputs
                  .length
              }{" "}
              required{" "}
              {missingRequiredInputs
                .length ===
              1
                ? "field is"
                : "fields are"}{" "}
              still missing.
            </p>

            <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-amber-800">
              {missingRequiredInputs.map(
                (
                  input
                ) => (
                  <li
                    key={
                      input.rowId
                    }
                  >
                    <span className="font-medium">
                      {
                        input.inputName
                      }
                    </span>

                    <span className="text-amber-700">
                      {" "}
                      —{" "}
                      {
                        input.category
                      }
                    </span>
                  </li>
                )
              )}
            </ul>
          </div>
        )}

      {/* ============================================
          Backend save error
      ============================================ */}

      {saveMutation
        .isError && (
        <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <p className="font-semibold">
            We couldn&apos;t
            save the
            assessment.
          </p>

          <p className="mt-2 whitespace-pre-line">
            {saveMutation
              .error instanceof
            Error
              ? saveMutation
                  .error
                  .message
              : "Please check the entered values and try again."}
          </p>
        </div>
      )}

      {/* ============================================
          Save success
      ============================================ */}

      {saveMessage &&
        !saveMutation
          .isError && (
          <div className="mt-6 rounded-2xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
            {
              saveMessage
            }
          </div>
        )}

      {/* ============================================
          Actions
      ============================================ */}

      <div className="sticky bottom-16 mt-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-lg md:bottom-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            {missingRequiredInputs.length >
              0 && (
              <p className="text-sm text-slate-500">
                {
                  missingRequiredInputs
                    .length
                }{" "}
                required{" "}
                {missingRequiredInputs
                  .length ===
                1
                  ? "field"
                  : "fields"}{" "}
                remaining
              </p>
            )}

            {missingRequiredInputs.length ===
              0 && (
              <p className="text-sm font-medium text-green-700">
                All required
                fields completed.
              </p>
            )}
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              disabled={
                saveMutation
                  .isPending
              }
              onClick={() => {
                setSaveMessage(
                  ""
                );

                setValidationAttempted(
                  false
                );

                saveMutation.mutate(
                  "Draft"
                );
              }}
              className="rounded-xl border border-slate-300 bg-white px-5 py-3 font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saveMutation
                .isPending
                ? "Saving..."
                : "Save Draft"}
            </button>

            <button
              type="button"
              disabled={
                saveMutation
                  .isPending ||
                assessment.status ===
                  "Completed"
              }
              onClick={() => {
                setSaveMessage(
                  ""
                );

                setValidationAttempted(
                  true
                );

                if (
                  missingRequiredInputs.length >
                  0
                ) {
                  return;
                }

                saveMutation.mutate(
                  "Completed"
                );
              }}
              className="rounded-xl bg-[#2F80ED] px-5 py-3 font-semibold text-white transition hover:bg-[#1F6FD1] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saveMutation
                .isPending
                ? "Completing..."
                : "Complete Assessment"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}