import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Link } from "react-router-dom";

import {
  requestPasswordReset,
} from "../services/authService";

export default function ForgotPasswordPage() {
  const [mobile, setMobile] = useState("");
  const [formError, setFormError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const resetMutation = useMutation({
    mutationFn: requestPasswordReset,

    onSuccess: (response) => {
      setSuccessMessage(response.message);
    },
  });

  const handleSubmit = (
    event: React.FormEvent
  ) => {
    event.preventDefault();

    setFormError("");
    setSuccessMessage("");

    if (!mobile.trim()) {
      setFormError(
        "Please enter your mobile number."
      );
      return;
    }

    resetMutation.mutate(
      mobile.trim()
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8">
      <div className="mx-auto flex min-h-[85vh] max-w-md items-center">
        <div className="w-full">
          <div className="text-center">
            <div className="text-3xl font-bold text-[#12395B]">
              Club
              <span className="text-[#2F80ED]">
                100
              </span>
            </div>

            <p className="mt-3 text-slate-600">
              Live Strong. Age Better. Together.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="mt-8 rounded-2xl bg-white p-6 shadow-sm"
          >
            <h1 className="text-2xl font-bold text-slate-900">
              Forgot password?
            </h1>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Enter your registered mobile number.
              We&apos;ll arrange for a password reset
              link to be sent to you.
            </p>

            <div className="mt-6">
              <label className="text-sm font-medium text-slate-700">
                Mobile Number
              </label>

              <input
                type="tel"
                value={mobile}
                onChange={(event) =>
                  setMobile(event.target.value)
                }
                autoComplete="tel"
                placeholder="Enter mobile number"
                className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-[#2F80ED]"
              />
            </div>

            {formError && (
              <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {formError}
              </div>
            )}

            {resetMutation.isError && (
              <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                We couldn&apos;t process your request.
                Please try again.
              </div>
            )}

            {successMessage && (
              <div className="mt-5 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm leading-6 text-green-700">
                {successMessage}
              </div>
            )}

            <button
              type="submit"
              disabled={resetMutation.isPending}
              className="mt-6 w-full rounded-xl bg-[#2F80ED] px-4 py-3 font-semibold text-white transition hover:bg-[#1F6FD1] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {resetMutation.isPending
                ? "Submitting..."
                : "Request Reset Link"}
            </button>

            <p className="mt-6 text-center text-sm text-slate-500">
              Remember your password?{" "}
              <Link
                to="/login"
                className="font-semibold text-[#2F80ED]"
              >
                Sign In
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}