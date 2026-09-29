import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";

import {
  login,
} from "../services/authService";

export default function LoginPage() {
  const navigate = useNavigate();

  const [mobile, setMobile] =
    useState("");

  const [password, setPassword] =
    useState("");

  const loginMutation = useMutation({
    mutationFn: () =>
      login(mobile, password),

    onSuccess: (response) => {
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
    },
  });

  const handleSubmit = (
    event: React.FormEvent
  ) => {
    event.preventDefault();

    if (
      !mobile.trim() ||
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

            <div className="mt-6">
              <label className="text-sm font-medium text-slate-700">
                Mobile Number
              </label>

              <input
                type="tel"
                value={mobile}
                onChange={(event) =>
                  setMobile(
                    event.target.value
                  )
                }
                autoComplete="tel"
                placeholder="Enter mobile number"
                className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-[#2F80ED]"
              />
            </div>

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

            {loginMutation.isError && (
              <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                Invalid mobile number or
                password.
              </div>
            )}

            <button
              type="submit"
              disabled={
                loginMutation.isPending ||
                !mobile.trim() ||
                !password
              }
              className="mt-6 w-full rounded-xl bg-[#2F80ED] px-4 py-3 font-semibold text-white transition hover:bg-[#1F6FD1] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loginMutation.isPending
                ? "Signing in..."
                : "Sign In"}
            </button>

            <Link
              to="/forgot-password"
              className="text-sm font-semibold text-[#2F80ED]"
              >
                Forgot password?
            </Link>
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