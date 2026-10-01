import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";

import {
  login,
} from "../services/authService";

export default function LoginPage() {
  const navigate = useNavigate();

  const [loginId, setLoginId] =
    useState("");

  const [password, setPassword] =
    useState("");

  const loginMutation = useMutation({
    mutationFn: () =>
      login(loginId, password),

    onSuccess: (response) => {
      const isTrainer =
        response.roles.includes("trainer");

      const isMember =
        response.roles.includes("member");

      // -------------------------------------------------
      // Trainer takes priority when user has both roles.
      // -------------------------------------------------

      if (isTrainer) {
        navigate(
          "/trainer",
          {
            replace: true,
          }
        );

        return;
      }

      // -------------------------------------------------
      // Member-only flow
      // -------------------------------------------------

      if (
        isMember &&
        response.member
      ) {
        if (
          response.member.onboardingStatus !==
          "Completed"
        ) {
          navigate(
            "/onboarding",
            {
              replace: true,
            }
          );

          return;
        }

        navigate(
          "/dashboard",
          {
            replace: true,
          }
        );

        return;
      }

      // -------------------------------------------------
      // Defensive fallback
      // -------------------------------------------------

      navigate(
        "/login",
        {
          replace: true,
        }
      );
    },
  });

  const handleSubmit = (
    event: React.FormEvent
  ) => {
    event.preventDefault();

    if (
      !loginId.trim() ||
      !password
    ) {
      return;
    }

    loginMutation.mutate();
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8">
      <div className="mx-auto flex min-h-[80vh] max-w-md items-center">
        <div className="w-full">
          {/* ============================================
              Brand
          ============================================ */}

          <div className="text-center">
            <div className="text-3xl font-bold text-[#12395B]">
              Club
              <span className="text-[#2F80ED]">
                100
              </span>
            </div>

            <p className="mt-3 text-slate-600">
              Live Strong. Age Better.
              Together.
            </p>
          </div>

          {/* ============================================
              Login form
          ============================================ */}

          <form
            onSubmit={handleSubmit}
            className="mt-8 rounded-2xl bg-white p-6 shadow-sm"
          >
            <h1 className="text-2xl font-bold text-slate-900">
              Welcome back
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Sign in to your Club100
              account.
            </p>

            {/* Login ID */}

            <div className="mt-6">
              <label className="text-sm font-medium text-slate-700">
                Mobile Number or Email
              </label>

              <input
                type="text"
                value={loginId}
                onChange={(event) =>
                  setLoginId(
                    event.target.value
                  )
                }
                autoComplete="username"
                placeholder="Enter mobile number or email"
                className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-[#2F80ED]"
              />
            </div>

            {/* Password */}

            <div className="mt-5">
              <label className="text-sm font-medium text-slate-700">
                Password
              </label>

              <input
                type="password"
                value={password}
                onChange={(event) =>
                  setPassword(
                    event.target.value
                  )
                }
                autoComplete="current-password"
                placeholder="Enter password"
                className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-[#2F80ED]"
              />
            </div>

            {/* Error */}

            {loginMutation.isError && (
              <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                Invalid login ID or password.
              </div>
            )}

            {/* Submit */}

            <button
              type="submit"
              disabled={
                loginMutation.isPending ||
                !loginId.trim() ||
                !password
              }
              className="mt-6 w-full rounded-xl bg-[#2F80ED] px-4 py-3 font-semibold text-white transition hover:bg-[#1F6FD1] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loginMutation.isPending
                ? "Signing in..."
                : "Sign In"}
            </button>

            {/* Forgot password */}

            <div className="mt-4 text-center">
              <Link
                to="/forgot-password"
                className="text-sm font-semibold text-[#2F80ED]"
              >
                Forgot password?
              </Link>
            </div>

            {/* Registration */}

            <p className="mt-6 text-center text-sm text-slate-500">
              New to Club100?{" "}
              <Link
                to="/register"
                className="font-semibold text-[#2F80ED]"
              >
                Create Account
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}