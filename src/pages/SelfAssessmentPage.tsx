import {
  useEffect,
  useMemo,
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

import PageContainer from "../components/layout/PageContainer";
import AssessmentInputField, {
  isAssessmentInputEmpty,
  type AssessmentInputState,
} from "../components/assessment/AssessmentInputField";

import {
  completeSelfAssessment,
  getSelfAssessment,
  saveSelfAssessment,
  type MemberSelfAssessmentInput,
  type MemberSelfAssessmentSaveInput,
} from "../services/memberService";

const CATEGORY_ORDER = [
  "Body Composition",
  "Cardiovascular Health",
  "Strength & Endurance",
  "Mobility & Balance",
  "Well-being & Readiness",
];

type InputGroupDefinition = {
  key: string;
  title: string;
  category: string;
  inputCodes: string[];
  helperText: string;
};

const INPUT_GROUPS: InputGroupDefinition[] = [
  {
    key: "body-measurements",
    title: "Height & Weight",
    category: "Body Composition",
    inputCodes: ["HEIGHT", "WEIGHT"],
    helperText:
      "These measurements are used together to calculate your BMI.",
  },
  {
    key: "blood-pressure",
    title: "Blood Pressure",
    category: "Cardiovascular Health",
    inputCodes: ["BP_SYS", "BP_DIA"],
    helperText:
      "Optional. Enter both readings if you have a blood pressure monitor.",
  },
  {
    key: "push-ups",
    title: "Push-ups",
    category: "Strength & Endurance",
    inputCodes: ["PUSHUP_TYPE", "PUSHUP_REPS"],
    helperText:
      "Optional. Choose the variation you used and enter the repetitions completed.",
  },
  {
    key: "shoulder-flexibility",
    title: "Shoulder Flexibility",
    category: "Mobility & Balance",
    inputCodes: [
      "SHOULDER_LEFT",
      "SHOULDER_RIGHT",
    ],
    helperText:
      "Measure both sides using the same technique.",
  },
  {
    key: "single-leg-balance",
    title: "Single Leg Balance",
    category: "Mobility & Balance",
    inputCodes: [
      "BALANCE_LEFT",
      "BALANCE_RIGHT",
    ],
    helperText:
      "Measure both legs separately. Use the timer for each side.",
  },
  {
    key: "wellbeing-check-in",
    title: "Well-being Check-In",
    category: "Well-being & Readiness",
    inputCodes: [
      "ENERGY_LEVEL",
      "STRESS_LEVEL",
      "SLEEP_QUALITY",
      "DAILY_MOBILITY",
      "FITNESS_CONFIDENCE",
      "MOTIVATION",
      "OVERALL_WELLBEING",
    ],
    helperText:
      "Rate each item from 1 to 10 based on how you feel currently.",
  },
];

type DisplayItem =
  | {
      kind: "input";
      key: string;
      input: MemberSelfAssessmentInput;
    }
  | {
      kind: "group";
      key: string;
      title: string;
      helperText: string;
      inputs: MemberSelfAssessmentInput[];
    };

function buildDisplayItems(
  category: string,
  inputs: MemberSelfAssessmentInput[]
): DisplayItem[] {
  const groups = INPUT_GROUPS.filter(
    (group) => group.category === category
  );

  const groupByCode = new Map<
    string,
    InputGroupDefinition
  >();

  for (const group of groups) {
    for (const code of group.inputCodes) {
      groupByCode.set(code, group);
    }
  }

  const usedGroups = new Set<string>();
  const items: DisplayItem[] = [];

  for (const input of inputs) {
    const code = input.inputCode ?? "";
    const group = groupByCode.get(code);

    if (!group) {
      items.push({
        kind: "input",
        key: input.rowId,
        input,
      });
      continue;
    }

    if (usedGroups.has(group.key)) {
      continue;
    }

    const groupedInputs = group.inputCodes
      .map((groupCode) =>
        inputs.find(
          (candidate) =>
            candidate.inputCode === groupCode
        )
      )
      .filter(
        (
          candidate
        ): candidate is MemberSelfAssessmentInput =>
          Boolean(candidate)
      );

    if (groupedInputs.length < 2) {
      items.push({
        kind: "input",
        key: input.rowId,
        input,
      });
      continue;
    }

    usedGroups.add(group.key);
    items.push({
      kind: "group",
      key: group.key,
      title: group.title,
      helperText: group.helperText,
      inputs: groupedInputs,
    });
  }

  return items;
}

function displayItemIsRequired(
  item: DisplayItem
) {
  return item.kind === "input"
    ? item.input.required
    : item.inputs.some(
        (input) => input.required
      );
}

function displayItemIsComplete(
  item: DisplayItem,
  inputState: Record<
    string,
    AssessmentInputState
  >
) {
  const inputs =
    item.kind === "input"
      ? [item.input]
      : item.inputs;

  const relevantInputs =
    displayItemIsRequired(item)
      ? inputs.filter(
          (input) => input.required
        )
      : inputs;

  return relevantInputs.every(
    (input) =>
      !isAssessmentInputEmpty(
        input,
        inputState[input.rowId]
      )
  );
}

function getDisplayItemEquipment(
  item: DisplayItem
) {
  const inputs =
    item.kind === "input"
      ? [item.input]
      : item.inputs;

  return Array.from(
    new Set(
      inputs
        .map(
          (input) =>
            input.equipmentRequired
        )
        .filter(
          (equipment): equipment is string =>
            Boolean(equipment) &&
            equipment !== "None"
        )
    )
  );
}

export default function SelfAssessmentPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { assessmentId } = useParams<{
    assessmentId: string;
  }>();

  const [inputState, setInputState] =
    useState<Record<string, AssessmentInputState>>({});

  const [saveMessage, setSaveMessage] =
    useState("");

  const [validationAttempted, setValidationAttempted] =
    useState(false);

  const assessmentQuery = useQuery({
    queryKey: [
      "member-self-assessment",
      assessmentId,
    ],
    queryFn: () =>
      getSelfAssessment(
        assessmentId!
      ),
    enabled: !!assessmentId,
  });

  useEffect(() => {
    const inputs =
      assessmentQuery.data?.assessment.inputs;

    if (!inputs) {
      return;
    }

    const initialState: Record<
      string,
      AssessmentInputState
    > = {};

    for (const input of inputs) {
      initialState[input.rowId] = {
        value: input.hasValue
          ? String(input.value ?? 0)
          : "",
        textValue:
          input.textValue ?? "",
      };
    }

    setInputState(initialState);
  }, [assessmentQuery.data]);

  const groupedInputs = useMemo(() => {
    const inputs =
      assessmentQuery.data?.assessment.inputs ?? [];

    const groups = inputs.reduce<
      Record<string, MemberSelfAssessmentInput[]>
    >((result, input) => {
      const category = input.category || "Other";

      if (!result[category]) {
        result[category] = [];
      }

      result[category].push(input);
      return result;
    }, {});

    return Object.entries(groups).sort(
      ([a], [b]) => {
        const ai = CATEGORY_ORDER.indexOf(a);
        const bi = CATEGORY_ORDER.indexOf(b);
        return (
          (ai === -1 ? 999 : ai) -
          (bi === -1 ? 999 : bi)
        );
      }
    );
  }, [assessmentQuery.data]);

  const allDisplayItems = useMemo(
    () =>
      groupedInputs.flatMap(
        ([category, inputs]) =>
          buildDisplayItems(
            category,
            inputs
          )
      ),
    [groupedInputs]
  );

  const requiredDisplayItems = useMemo(
    () =>
      allDisplayItems.filter(
        displayItemIsRequired
      ),
    [allDisplayItems]
  );

  const missingRequiredItems = useMemo(
    () =>
      requiredDisplayItems.filter(
        (item) =>
          !displayItemIsComplete(
            item,
            inputState
          )
      ),
    [requiredDisplayItems, inputState]
  );

  const completedRequiredItems = useMemo(
    () =>
      requiredDisplayItems.filter(
        (item) =>
          displayItemIsComplete(
            item,
            inputState
          )
      ),
    [requiredDisplayItems, inputState]
  );

  function buildPayload(): MemberSelfAssessmentSaveInput[] {
    const inputs =
      assessmentQuery.data?.assessment.inputs ?? [];

    return inputs.map((input) => {
      const state =
        inputState[input.rowId] ?? {
          value: "",
          textValue: "",
        };

      return {
        rowId: input.rowId,
        value:
          state.value === ""
            ? null
            : Number(state.value),
        textValue:
          state.textValue === ""
            ? null
            : state.textValue,
      };
    });
  }

  const saveMutation = useMutation({
    mutationFn: async (
      action: "Draft" | "Completed"
    ) => {
      const payload = buildPayload();

      return action === "Completed"
        ? completeSelfAssessment(
            assessmentId!,
            payload
          )
        : saveSelfAssessment(
            assessmentId!,
            payload
          );
    },

    onSuccess: async (response) => {
      setValidationAttempted(false);

      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: [
            "member-self-assessment",
            assessmentId,
          ],
        }),
        queryClient.invalidateQueries({
          queryKey: [
            "member-assessment-context",
          ],
        }),
        queryClient.invalidateQueries({
          queryKey: [
            "member-progress",
          ],
        }),
      ]);

      if (
        response.assessment.status ===
        "Completed"
      ) {
        navigate(
          `/progress/${assessmentId}`,
          { replace: true }
        );
        return;
      }

      setSaveMessage("Draft saved.");
    },
  });

  if (assessmentQuery.isLoading) {
    return (
      <PageContainer>
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          Loading assessment...
        </div>
      </PageContainer>
    );
  }

  if (
    assessmentQuery.isError ||
    !assessmentQuery.data
  ) {
    return (
      <PageContainer>
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
          <p className="font-semibold text-red-700">
            We couldn&apos;t load this assessment.
          </p>
          <button
            type="button"
            onClick={() =>
              navigate("/assessment")
            }
            className="mt-4 text-sm font-semibold text-[#2F80ED]"
          >
            ← Back to Assessment
          </button>
        </div>
      </PageContainer>
    );
  }

  const assessment =
    assessmentQuery.data.assessment;

  const completionPercent =
    requiredDisplayItems.length
      ? Math.round(
          (completedRequiredItems.length /
            requiredDisplayItems.length) *
            100
        )
      : 100;

  return (
    <PageContainer>
      <div className="space-y-4 sm:space-y-6">
        <div className="rounded-2xl bg-white p-4 shadow-sm sm:p-5">
          <button
            type="button"
            onClick={() =>
              navigate("/assessment")
            }
            className="text-sm font-semibold text-[#2F80ED]"
          >
            ← Assessment Home
          </button>

          <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-[#2F80ED]">
                {assessment.assessmentType} · Self Assessment
              </p>
              <h1 className="mt-2 text-2xl font-bold text-[#12395B]">
                Club100 Fitness Assessment
              </h1>
              <p className="mt-2 text-sm text-slate-600">
                Work through each section carefully. You can save and continue later.
              </p>
            </div>

            <div className="flex w-full items-center justify-between rounded-xl bg-slate-50 px-4 py-3 sm:block sm:w-auto sm:min-w-32 sm:text-right">
              <p className="text-xs text-slate-500">
                Required progress
              </p>
              <p className="text-xl font-bold text-[#12395B]">
                {completionPercent}%
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          Stop the assessment if you experience pain, dizziness, unusual shortness of breath, or feel unwell.
        </div>

        {groupedInputs.map(
          ([category, inputs]) => {
            const displayItems =
              buildDisplayItems(
                category,
                inputs
              );

            const requiredItems =
              displayItems.filter(
                displayItemIsRequired
              );

            const progressItems =
              requiredItems.length > 0
                ? requiredItems
                : displayItems;

            const categoryCompleted =
              progressItems.filter(
                (item) =>
                  displayItemIsComplete(
                    item,
                    inputState
                  )
              ).length;

            const categoryIsOptional =
              requiredItems.length === 0;

            return (
              <section
                key={category}
                className="rounded-2xl bg-white p-4 shadow-sm sm:p-5"
              >
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-lg font-bold text-[#12395B]">
                      {category}
                    </h2>

                    {categoryIsOptional && (
                      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-500">
                        Optional
                      </span>
                    )}
                  </div>

                  <span className="text-xs text-slate-400">
                    {categoryCompleted}/{progressItems.length} {categoryIsOptional ? "optional" : "required"}
                  </span>
                </div>

                {categoryIsOptional && (
                  <p className="mt-2 text-sm text-slate-500">
                    Complete these measurements if you have the required equipment.
                  </p>
                )}

                <div className="mt-4 grid gap-4 lg:grid-cols-2 sm:mt-5 sm:gap-5">
                  {displayItems.map((item) => {
                    if (item.kind === "input") {
                      const input = item.input;

                      return (
                        <AssessmentInputField
                          key={item.key}
                          input={input}
                          state={
                            inputState[input.rowId] ?? {
                              value: "",
                              textValue: "",
                            }
                          }
                          showValidation={validationAttempted}
                          onChange={(next) => {
                            setInputState(
                              (current) => ({
                                ...current,
                                [input.rowId]: next,
                              })
                            );
                            setSaveMessage("");
                          }}
                        />
                      );
                    }

                    const groupRequired =
                      item.inputs.some(
                        (input) => input.required
                      );

                    return (
                      <div
                        key={item.key}
                        className="rounded-2xl border border-slate-200 p-3 sm:p-4 lg:col-span-2"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-sm font-bold text-slate-800">
                              {item.title}
                              {groupRequired && (
                                <span className="ml-1 text-red-500">
                                  *
                                </span>
                              )}
                            </h3>

                            {!groupRequired && (
                              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-500">
                                Optional
                              </span>
                            )}
                          </div>

                          <div className="flex flex-wrap gap-2">
                            {getDisplayItemEquipment(
                              item
                            ).map(
                              (equipment) => (
                                <span
                                  key={equipment}
                                  className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600"
                                >
                                  {equipment}
                                </span>
                              )
                            )}
                          </div>
                        </div>

                        <p className="mt-1 text-sm text-slate-500">
                          {item.helperText}
                        </p>

                        <div className="mt-4 grid gap-4 lg:grid-cols-2 sm:gap-5">
                          {item.inputs.map(
                            (input) => (
                              <AssessmentInputField
                                key={input.rowId}
                                input={input}
                                state={
                                  inputState[input.rowId] ?? {
                                    value: "",
                                    textValue: "",
                                  }
                                }
                                showValidation={validationAttempted}
                                embedded
                                hideRequirementIndicator
                                hideEquipment
                                onChange={(next) => {
                                  setInputState(
                                    (current) => ({
                                      ...current,
                                      [input.rowId]: next,
                                    })
                                  );
                                  setSaveMessage("");
                                }}
                              />
                            )
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          }
        )}

        {validationAttempted &&
          missingRequiredItems.length > 0 && (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
              <p className="font-semibold text-amber-900">
                Complete the required measurements before finishing.
              </p>
              <p className="mt-1 text-sm text-amber-700">
                {missingRequiredItems.length} required test{missingRequiredItems.length === 1 ? " is" : "s are"} still incomplete.
              </p>
              <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-amber-800">
                {missingRequiredItems.map(
                  (item) => (
                    <li key={item.key}>
                      {item.kind === "input"
                        ? item.input.inputName
                        : item.title}
                    </li>
                  )
                )}
              </ul>
            </div>
          )}

        {saveMutation.isError && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <p className="font-semibold">
              We couldn&apos;t save the assessment.
            </p>
            <p className="mt-2 whitespace-pre-line">
              {saveMutation.error instanceof Error
                ? saveMutation.error.message
                : "Please check your entries and try again."}
            </p>
          </div>
        )}

        {saveMessage &&
          !saveMutation.isError && (
            <div className="rounded-2xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
              {saveMessage}
            </div>
          )}

        <div className="sticky bottom-16 z-20 rounded-2xl border border-slate-200 bg-white p-3 shadow-lg lg:bottom-4 lg:p-4">
          <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
            <p className="text-center text-xs text-slate-500 sm:text-sm lg:text-left">
              {missingRequiredItems.length > 0
                ? `${missingRequiredItems.length} required test${missingRequiredItems.length === 1 ? "" : "s"} remaining`
                : "All required tests completed."}
            </p>

            <div className="grid grid-cols-2 gap-2 sm:gap-3">
              <button
                type="button"
                disabled={saveMutation.isPending}
                onClick={() => {
                  setValidationAttempted(false);
                  setSaveMessage("");
                  saveMutation.mutate("Draft");
                }}
                className="rounded-xl border border-slate-300 bg-white px-3 py-3 text-sm font-semibold text-slate-700 disabled:opacity-50 sm:px-5 sm:text-base"
              >
                {saveMutation.isPending ? (
                  "Saving..."
                ) : (
                  <>
                    <span className="sm:hidden">Save for later</span>
                    <span className="hidden sm:inline">Save & Continue Later</span>
                  </>
                )}
              </button>

              <button
                type="button"
                disabled={
                  saveMutation.isPending ||
                  missingRequiredItems.length > 0
                }
                onClick={() => {
                  setValidationAttempted(true);
                  setSaveMessage("");

                  if (
                    missingRequiredItems.length > 0
                  ) {
                    return;
                  }

                  saveMutation.mutate(
                    "Completed"
                  );
                }}
                className={[
                  "rounded-xl px-3 py-3 text-sm font-semibold transition sm:px-5 sm:text-base",
                  missingRequiredItems.length > 0
                    ? "cursor-not-allowed bg-slate-200 text-slate-500"
                    : "bg-[#2F80ED] text-white",
                  saveMutation.isPending
                    ? "opacity-50"
                    : "",
                ].join(" ")}
              >
                {saveMutation.isPending ? (
                  "Completing..."
                ) : (
                  <>
                    <span className="sm:hidden">Complete</span>
                    <span className="hidden sm:inline">Complete Assessment</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
