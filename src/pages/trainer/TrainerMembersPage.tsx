import {
  useState,
} from "react";

import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

import {
  getTrainerMembers,
  type TrainerMemberSummary,
} from "../../services/trainerService";

function MemberCard({
  member,
  onOpen,
}: {
  member: TrainerMemberSummary;
  onOpen: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="w-full rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:border-[#2F80ED] hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h3 className="truncate text-base font-semibold text-slate-900">
            {member.fullName}
          </h3>

          <div className="mt-2 space-y-1 text-sm text-slate-500">
            {member.mobile && (
              <p>
                Mobile: {member.mobile}
              </p>
            )}

            {member.email && (
              <p className="truncate">
                Email: {member.email}
              </p>
            )}
          </div>
        </div>

        <div className="shrink-0">
          <span className="rounded-full bg-[#EAF4FC] px-3 py-1 text-xs font-semibold text-[#2F80ED]">
            View
          </span>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-500">
        {member.gender && (
          <span className="rounded-full bg-slate-100 px-3 py-1">
            {member.gender}
          </span>
        )}

        {member.onboardingStatus && (
          <span className="rounded-full bg-slate-100 px-3 py-1">
            {member.onboardingStatus}
          </span>
        )}
      </div>
    </button>
  );
}

export default function TrainerMembersPage() {
  const navigate = useNavigate();

  const [search, setSearch] =
    useState("");

  const [submittedSearch, setSubmittedSearch] =
    useState("");

  const canSearch =
    submittedSearch.trim().length >= 2;

  const membersQuery = useQuery({
    queryKey: [
      "trainer-members",
      submittedSearch,
    ],

    queryFn: () =>
      getTrainerMembers(
        submittedSearch
      ),

    enabled: canSearch,
  });

  const members =
    membersQuery.data ?? [];

  const handleSearch = (
    event: React.FormEvent
  ) => {
    event.preventDefault();

    const normalized =
      search.trim();

    if (normalized.length < 2) {
      return;
    }

    setSubmittedSearch(
      normalized
    );
  };

  const clearSearch = () => {
    setSearch("");
    setSubmittedSearch("");
  };

  return (
    <div>
      {/* ============================================
          Header
      ============================================ */}

      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Members
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          Find members and open their
          trainer profile.
        </p>
      </div>

      {/* ============================================
          Search
      ============================================ */}

      <form
        onSubmit={handleSearch}
        className="mt-6 rounded-2xl bg-white p-4 shadow-sm"
      >
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            type="text"
            value={search}
            onChange={(event) =>
              setSearch(
                event.target.value
              )
            }
            placeholder="Search by name, mobile or email"
            className="min-w-0 flex-1 rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-[#2F80ED]"
          />

          <button
            type="submit"
            disabled={
              search.trim().length < 2
            }
            className="rounded-xl bg-[#2F80ED] px-5 py-3 font-semibold text-white transition hover:bg-[#1F6FD1] disabled:cursor-not-allowed disabled:opacity-50"
          >
            Search
          </button>

          {submittedSearch && (
            <button
              type="button"
              onClick={clearSearch}
              className="rounded-xl border border-slate-300 bg-white px-5 py-3 font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Clear
            </button>
          )}
        </div>

        <p className="mt-3 text-xs text-slate-400">
          Enter at least 2 characters.
        </p>
      </form>

      {/* ============================================
          Default State
      ============================================ */}

      {!canSearch && (
        <div className="mt-8 rounded-2xl bg-white p-8 text-center shadow-sm">
          <p className="font-medium text-slate-700">
            Find a Club100 member
          </p>

          <p className="mt-2 text-sm text-slate-500">
            Enter at least 2 characters from
            the member&apos;s name, mobile
            number or email.
          </p>
        </div>
      )}

      {/* ============================================
          Search Results
      ============================================ */}

      {canSearch && (
        <div className="mt-8">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Search Results
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Results for &quot;
                {submittedSearch}
                &quot;
              </p>
            </div>

            {!membersQuery.isLoading &&
              !membersQuery.isError && (
                <p className="shrink-0 text-sm text-slate-500">
                  {members.length}{" "}
                  {members.length === 1
                    ? "member"
                    : "members"}
                </p>
              )}
          </div>

          {/* Loading */}

          {membersQuery.isLoading && (
            <div className="mt-4 rounded-2xl bg-white p-6 shadow-sm">
              <p className="text-sm text-slate-500">
                Searching members...
              </p>
            </div>
          )}

          {/* Error */}

          {membersQuery.isError && (
            <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-5">
              <p className="font-medium text-red-700">
                We couldn&apos;t search
                members.
              </p>

              <p className="mt-1 text-sm text-red-600">
                Please try again.
              </p>
            </div>
          )}

          {/* No Results */}

          {!membersQuery.isLoading &&
            !membersQuery.isError &&
            members.length === 0 && (
              <div className="mt-4 rounded-2xl bg-white p-8 text-center shadow-sm">
                <p className="font-medium text-slate-700">
                  No members found
                </p>

                <p className="mt-2 text-sm text-slate-500">
                  Try another name, mobile
                  number or email.
                </p>
              </div>
            )}

          {/* Results */}

          {!membersQuery.isLoading &&
            !membersQuery.isError &&
            members.length > 0 && (
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                {members.map(
                  (member) => (
                    <MemberCard
                      key={member.id}
                      member={member}
                      onOpen={() =>
                        navigate(
                          `/trainer/members/${member.id}`
                        )
                      }
                    />
                  )
                )}
              </div>
            )}
        </div>
      )}
    </div>
  );
}