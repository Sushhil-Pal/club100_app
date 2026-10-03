import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  useNavigate,
} from "react-router-dom";

import {
  logout,
} from "../../services/authService";

import {
  getTrainerProfile,
  updateTrainerProfile,
  uploadTrainerProfilePhoto,
} from "../../services/trainerService";

type FormState = {
  mobile: string;
  email: string;
  bio: string;
  certifications: string;
  location: string;
};

function ReadOnlyField({
  label,
  value,
}: {
  label: string;
  value:
    | string
    | number
    | null;
}) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p className="mt-1 font-medium text-slate-800">
        {value || "—"}
      </p>
    </div>
  );
}

function EligibilityBadge({
  label,
  enabled,
}: {
  label: string;
  enabled: boolean;
}) {
  return (
    <span
      className={[
        "inline-flex rounded-full px-3 py-1.5 text-sm font-semibold",
        enabled
          ? "bg-green-50 text-green-700"
          : "bg-slate-100 text-slate-500",
      ].join(" ")}
    >
      {label}:{" "}
      {enabled
        ? "Yes"
        : "No"}
    </span>
  );
}

export default function TrainerProfilePage() {
  const navigate =
    useNavigate();

  const queryClient =
    useQueryClient();

  const photoInputRef =
    useRef<HTMLInputElement>(
      null
    );

  const [
    isEditing,
    setIsEditing,
  ] = useState(false);

  const [
    successMessage,
    setSuccessMessage,
  ] = useState("");

  const [
    photoError,
    setPhotoError,
  ] = useState("");

  const [
    form,
    setForm,
  ] = useState<FormState>({
    mobile: "",
    email: "",
    bio: "",
    certifications: "",
    location: "",
  });

  // ---------------------------------------------------------
  // Profile
  // ---------------------------------------------------------

  const profileQuery =
    useQuery({
      queryKey: [
        "trainer-profile",
      ],

      queryFn:
        getTrainerProfile,
    });

  useEffect(() => {
    if (!profileQuery.data) {
      return;
    }

    const trainer =
      profileQuery.data;

    setForm({
      mobile:
        trainer.mobile ?? "",

      email:
        trainer.email ?? "",

      bio:
        trainer.bio ?? "",

      certifications:
        trainer.certifications ??
        "",

      location:
        trainer.location ?? "",
    });
  }, [
    profileQuery.data,
  ]);

  // ---------------------------------------------------------
  // Update profile
  // ---------------------------------------------------------

  const updateMutation =
    useMutation({
      mutationFn: () =>
        updateTrainerProfile(
          form
        ),

      onSuccess: async (
        response
      ) => {
        queryClient.setQueryData(
          [
            "trainer-profile",
          ],
          response.trainer
        );

        setIsEditing(
          false
        );

        setSuccessMessage(
          "Profile updated successfully."
        );

        await queryClient
          .invalidateQueries({
            queryKey: [
              "trainer-profile",
            ],
          });
      },
    });

  // ---------------------------------------------------------
  // Profile photo
  // ---------------------------------------------------------

  const photoMutation =
    useMutation({
      mutationFn: (
        file: File
      ) =>
        uploadTrainerProfilePhoto(
          file
        ),

      onSuccess: async () => {
        setPhotoError(
          ""
        );

        setSuccessMessage(
          "Profile photo updated successfully."
        );

        await queryClient
          .invalidateQueries({
            queryKey: [
              "trainer-profile",
            ],
          });
      },

      onError: (
        error
      ) => {
        setPhotoError(
          error instanceof Error
            ? error.message
            : "Profile photo could not be uploaded."
        );
      },
    });

  // ---------------------------------------------------------
  // Logout
  // ---------------------------------------------------------

  const logoutMutation =
    useMutation({
      mutationFn:
        logout,

      onSuccess: () => {
        queryClient.clear();

        navigate(
          "/login",
          {
            replace: true,
          }
        );
      },
    });

  // ---------------------------------------------------------
  // Loading
  // ---------------------------------------------------------

  if (
    profileQuery.isLoading
  ) {
    return (
      <div className="rounded-2xl bg-white p-6 shadow-sm">
        Loading profile...
      </div>
    );
  }

  // ---------------------------------------------------------
  // Error
  // ---------------------------------------------------------

  if (
    profileQuery.isError ||
    !profileQuery.data
  ) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-5">
        <p className="font-semibold text-red-700">
          We couldn&apos;t load your profile.
        </p>

        {profileQuery.error instanceof
          Error && (
          <p className="mt-2 text-sm text-red-700">
            {
              profileQuery.error
                .message
            }
          </p>
        )}
      </div>
    );
  }

  const trainer =
    profileQuery.data;

  // ---------------------------------------------------------
  // Cancel editing
  // ---------------------------------------------------------

  function cancelEditing() {
    setForm({
      mobile:
        trainer.mobile ?? "",

      email:
        trainer.email ?? "",

      bio:
        trainer.bio ?? "",

      certifications:
        trainer.certifications ??
        "",

      location:
        trainer.location ?? "",
    });

    setIsEditing(
      false
    );

    setSuccessMessage(
      ""
    );
  }

  // ---------------------------------------------------------
  // Photo selection
  // ---------------------------------------------------------

  function handlePhotoSelected(
    event:
      React.ChangeEvent<HTMLInputElement>
  ) {
    const file =
      event.target.files?.[0];

    event.target.value =
      "";

    if (!file) {
      return;
    }

    setPhotoError(
      ""
    );

    setSuccessMessage(
      ""
    );

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (
      !allowedTypes.includes(
        file.type
      )
    ) {
      setPhotoError(
        "Please choose a JPEG, PNG or WebP image."
      );

      return;
    }

    const maxSize =
      5 * 1024 * 1024;

    if (
      file.size > maxSize
    ) {
      setPhotoError(
        "Profile photo must be smaller than 5 MB."
      );

      return;
    }

    photoMutation.mutate(
      file
    );
  }

  return (
    <div className="space-y-6">
      {/* --------------------------------------------------
          Header
      -------------------------------------------------- */}

      <div>
        <h1 className="text-2xl font-bold text-[#12395B]">
          Profile
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          Your Club100 trainer profile and account information.
        </p>
      </div>

      {/* --------------------------------------------------
          Main profile card
      -------------------------------------------------- */}

      <section className="rounded-2xl bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-center gap-4">
            {/* Photo */}

            <div className="relative shrink-0">
              {trainer.photo ? (
                <img
                  src={
                    trainer.photo
                  }
                  alt={
                    trainer.trainerName
                  }
                  className="h-20 w-20 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#EAF4FC] text-2xl font-bold text-[#12395B]">
                  {trainer.trainerName
                    ?.trim()
                    .charAt(0)
                    .toUpperCase() ||
                    "T"}
                </div>
              )}

              <button
                type="button"
                disabled={
                  photoMutation
                    .isPending
                }
                onClick={() =>
                  photoInputRef.current
                    ?.click()
                }
                className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-[#2F80ED] text-lg font-bold text-white shadow transition hover:bg-[#1F6FD1] disabled:opacity-50"
                aria-label="Change profile photo"
                title="Change profile photo"
              >
                {photoMutation
                  .isPending
                  ? "…"
                  : "+"}
              </button>

              <input
                ref={
                  photoInputRef
                }
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={
                  handlePhotoSelected
                }
                className="hidden"
              />
            </div>

            <div>
              <h2 className="text-2xl font-bold text-[#12395B]">
                {
                  trainer.trainerName
                }
              </h2>

              <div className="mt-2 flex flex-wrap gap-2">
                {trainer.trainerType && (
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                    {
                      trainer.trainerType
                    }
                  </span>
                )}

                <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
                  {
                    trainer.status
                  }
                </span>
              </div>
            </div>
          </div>

          {!isEditing && (
            <button
              type="button"
              onClick={() => {
                setIsEditing(
                  true
                );

                setSuccessMessage(
                  ""
                );

                setPhotoError(
                  ""
                );
              }}
              className="rounded-xl border border-[#2F80ED] px-4 py-2.5 text-sm font-semibold text-[#2F80ED] transition hover:bg-[#F5FAFE]"
            >
              Edit Profile
            </button>
          )}
        </div>

        {trainer.bio &&
          !isEditing && (
          <p className="mt-6 whitespace-pre-line text-sm leading-6 text-slate-600">
            {trainer.bio}
          </p>
        )}
      </section>

      {/* --------------------------------------------------
          Photo upload error
      -------------------------------------------------- */}

      {photoError && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {photoError}
        </div>
      )}

      {/* --------------------------------------------------
          Edit form
      -------------------------------------------------- */}

      {isEditing && (
        <section className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-[#12395B]">
            Edit Profile
          </h2>

          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            {/* Mobile */}

            <div>
              <label className="text-sm font-medium text-slate-700">
                Mobile
              </label>

              <input
                type="text"
                value={
                  form.mobile
                }
                onChange={(
                  event
                ) =>
                  setForm(
                    (
                      current
                    ) => ({
                      ...current,

                      mobile:
                        event
                          .target
                          .value,
                    })
                  )
                }
                className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-[#2F80ED]"
              />
            </div>

            {/* Email */}

            <div>
              <label className="text-sm font-medium text-slate-700">
                Email
              </label>

              <input
                type="email"
                value={
                  form.email
                }
                onChange={(
                  event
                ) =>
                  setForm(
                    (
                      current
                    ) => ({
                      ...current,

                      email:
                        event
                          .target
                          .value,
                    })
                  )
                }
                className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-[#2F80ED]"
              />
            </div>

            {/* Location */}

            <div className="sm:col-span-2">
              <label className="text-sm font-medium text-slate-700">
                Location
              </label>

              <input
                type="text"
                value={
                  form.location
                }
                onChange={(
                  event
                ) =>
                  setForm(
                    (
                      current
                    ) => ({
                      ...current,

                      location:
                        event
                          .target
                          .value,
                    })
                  )
                }
                placeholder="e.g. Pune"
                className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-[#2F80ED]"
              />
            </div>

            {/* Bio */}

            <div className="sm:col-span-2">
              <label className="text-sm font-medium text-slate-700">
                Bio
              </label>

              <textarea
                value={
                  form.bio
                }
                onChange={(
                  event
                ) =>
                  setForm(
                    (
                      current
                    ) => ({
                      ...current,

                      bio:
                        event
                          .target
                          .value,
                    })
                  )
                }
                rows={4}
                placeholder="Tell members about your training background and approach."
                className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-[#2F80ED]"
              />
            </div>

            {/* Certifications */}

            <div className="sm:col-span-2">
              <label className="text-sm font-medium text-slate-700">
                Certifications
              </label>

              <textarea
                value={
                  form.certifications
                }
                onChange={(
                  event
                ) =>
                  setForm(
                    (
                      current
                    ) => ({
                      ...current,

                      certifications:
                        event
                          .target
                          .value,
                    })
                  )
                }
                rows={3}
                placeholder="Add your certifications and qualifications."
                className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-[#2F80ED]"
              />
            </div>
          </div>

          {/* Mutation error */}

          {updateMutation.isError && (
            <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {updateMutation
                .error instanceof
              Error
                ? updateMutation
                    .error.message
                : "Profile could not be updated."}
            </div>
          )}

          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              disabled={
                updateMutation
                  .isPending
              }
              onClick={
                cancelEditing
              }
              className="rounded-xl border border-slate-300 px-5 py-3 font-semibold text-slate-700 disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="button"
              disabled={
                updateMutation
                  .isPending
              }
              onClick={() => {
                setSuccessMessage(
                  ""
                );

                updateMutation.mutate();
              }}
              className="rounded-xl bg-[#2F80ED] px-5 py-3 font-semibold text-white transition hover:bg-[#1F6FD1] disabled:opacity-50"
            >
              {updateMutation
                .isPending
                ? "Saving..."
                : "Save Profile"}
            </button>
          </div>
        </section>
      )}

      {/* --------------------------------------------------
          Success message
      -------------------------------------------------- */}

      {successMessage && (
        <div className="rounded-2xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
          {successMessage}
        </div>
      )}

      {/* --------------------------------------------------
          Contact information
      -------------------------------------------------- */}

      {!isEditing && (
        <section className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-[#12395B]">
            Contact Information
          </h2>

          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <ReadOnlyField
              label="Mobile"
              value={
                trainer.mobile
              }
            />

            <ReadOnlyField
              label="Email"
              value={
                trainer.email
              }
            />

            <ReadOnlyField
              label="Location"
              value={
                trainer.location
              }
            />
          </div>
        </section>
      )}

      {/* --------------------------------------------------
          Certifications
      -------------------------------------------------- */}

      {!isEditing && (
        <section className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-[#12395B]">
            Certifications
          </h2>

          {trainer.certifications ? (
            <p className="mt-4 whitespace-pre-line text-sm leading-6 text-slate-600">
              {
                trainer.certifications
              }
            </p>
          ) : (
            <p className="mt-4 text-sm text-slate-500">
              No certifications added yet.
            </p>
          )}
        </section>
      )}

      {/* --------------------------------------------------
          Trainer configuration
      -------------------------------------------------- */}

      <section className="rounded-2xl bg-white p-6 shadow-sm">
        <h2 className="text-lg font-bold text-[#12395B]">
          Training Configuration
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          These settings are managed by Club100.
        </p>

        <div className="mt-5 flex flex-wrap gap-3">
          <EligibilityBadge
            label="Online"
            enabled={
              trainer.onlineEligible
            }
          />

          <EligibilityBadge
            label="Offline"
            enabled={
              trainer.offlineEligible
            }
          />
        </div>

        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <ReadOnlyField
            label="Trainer Type"
            value={
              trainer.trainerType
            }
          />

          <ReadOnlyField
            label="Maximum Online Cohort Size"
            value={
              trainer.maxOnlineCohortSize
            }
          />
        </div>
      </section>

      {/* --------------------------------------------------
          Account
      -------------------------------------------------- */}

      <section className="rounded-2xl bg-white p-6 shadow-sm">
        <h2 className="text-lg font-bold text-[#12395B]">
          Account
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Sign out of your Club100 trainer account on this device.
        </p>

        {logoutMutation.isError && (
          <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {logoutMutation.error instanceof
            Error
              ? logoutMutation.error
                  .message
              : "We couldn't log you out. Please try again."}
          </div>
        )}

        <button
          type="button"
          onClick={() =>
            logoutMutation.mutate()
          }
          disabled={
            logoutMutation.isPending
          }
          className="mt-5 w-full rounded-xl border border-red-200 px-4 py-3 font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {logoutMutation.isPending
            ? "Logging out..."
            : "Log Out"}
        </button>
      </section>
    </div>
  );
}