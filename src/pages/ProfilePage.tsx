import {
  useEffect,
  useState,
} from "react";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { useNavigate } from "react-router-dom";

import PageContainer from "../components/layout/PageContainer";

import {
  getCurrentMember,
  updateProfile,
} from "../services/memberService";

import { logout } from "../services/authService";

export default function ProfilePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const memberQuery = useQuery({
    queryKey: ["current-member"],
    queryFn: getCurrentMember,
  });

  const [fullName, setFullName] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [mobile, setMobile] =
    useState("");

  useEffect(() => {
    if (!memberQuery.data) return;

    setFullName(
      memberQuery.data.fullName ?? ""
    );

    setEmail(
      memberQuery.data.email ?? ""
    );

    setMobile(
      memberQuery.data.mobile ?? ""
    );
  }, [memberQuery.data]);

  const updateMutation = useMutation({
    mutationFn: updateProfile,

    onSuccess: (response) => {
      queryClient.setQueryData(
        ["current-member"],
        response.member
      );
    },
  });

  const logoutMutation = useMutation({
    mutationFn: logout,

    onSuccess: () => {
      queryClient.clear();

      navigate("/login", {
        replace: true,
      });
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
            We couldn&apos;t load your
            profile.
          </p>
        </div>
      </PageContainer>
    );
  }

  const member = memberQuery.data;

  const initials = member.fullName
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const handleSave = () => {
    if (!fullName.trim()) {
      return;
    }

    updateMutation.mutate({
      fullName: fullName.trim(),
      email: email.trim(),
      mobile: mobile.trim(),
    });
  };

  return (
    <PageContainer>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-[#12395B] md:text-4xl">
            Profile
          </h1>

          <p className="mt-2 text-slate-600">
            Manage your Club100 membership
            details.
          </p>
        </div>

        <section className="rounded-2xl bg-white p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 text-xl font-bold text-[#2F80ED]">
              {initials}
            </div>

            <div>
              <h2 className="text-xl font-semibold text-slate-900">
                {member.fullName}
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Active Club100 Member
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">
            Personal Information
          </h2>

          <div className="mt-5 space-y-5">
            <div>
              <label className="text-sm font-medium text-slate-600">
                Full Name
              </label>

              <input
                type="text"
                value={fullName}
                onChange={(event) =>
                  setFullName(
                    event.target.value
                  )
                }
                className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-[#2F80ED]"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-600">
                Email
              </label>

              <input
                type="email"
                value={email}
                onChange={(event) =>
                  setEmail(
                    event.target.value
                  )
                }
                className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-[#2F80ED]"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-600">
                Mobile
              </label>

              <input
                type="tel"
                value={mobile}
                onChange={(event) =>
                  setMobile(
                    event.target.value
                  )
                }
                className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-[#2F80ED]"
              />
            </div>
          </div>

          {updateMutation.isSuccess && (
            <div className="mt-5 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
              Profile updated successfully.
            </div>
          )}

          {updateMutation.isError && (
            <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              We couldn&apos;t update your
              profile. Please try again.
            </div>
          )}

          <button
            onClick={handleSave}
            disabled={
              updateMutation.isPending ||
              !fullName.trim()
            }
            className="mt-6 rounded-xl bg-[#2F80ED] px-5 py-3 font-semibold text-white transition hover:bg-[#1F6FD1] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {updateMutation.isPending
              ? "Saving..."
              : "Save Changes"}
          </button>
        </section>

        <section className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">
            Membership
          </h2>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-sm text-slate-500">
                Member Type
              </p>

              <p className="mt-2 font-semibold text-[#12395B]">
                {member.memberType || "—"}
              </p>
            </div>

            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-sm text-slate-500">
                Current Fitness Level
              </p>

              <p className="mt-2 font-semibold text-[#12395B]">
                {member.fitnessLevel || "—"}
              </p>
            </div>
          </div>

          {member.organization && (
            <div className="mt-4 rounded-xl bg-slate-50 p-4">
              <p className="text-sm text-slate-500">
                Organization
              </p>

              <p className="mt-2 font-semibold text-[#12395B]">
                {member.organization}
              </p>
            </div>
          )}
        </section>

        <section className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">
            Preferences
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            Notification preferences will
            be available in a later version.
          </p>
        </section>

        {logoutMutation.isError && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            We couldn&apos;t log you out.
            Please try again.
          </div>
        )}

        <button
          onClick={() =>
            logoutMutation.mutate()
          }
          disabled={
            logoutMutation.isPending
          }
          className="w-full rounded-xl border border-red-200 px-4 py-3 font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {logoutMutation.isPending
            ? "Logging out..."
            : "Log Out"}
        </button>
      </div>
    </PageContainer>
  );
}