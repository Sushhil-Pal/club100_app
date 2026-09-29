import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  resetPassword,
} from "../services/authService";

export default function ResetPasswordPage() {
  const navigate = useNavigate();

  const { token } = useParams<{
    token: string;
  }>();

  const [password, setPassword] =
    useState("");

  const [
    confirmPassword,
    setConfirmPassword,
  ] = useState("");

  const [formError, setFormError] =
    useState("");

  const [successMessage, setSuccessMessage] =
    useState("");

  const resetMutation = useMutation({
    mutationFn: ({
      token,
      password,
    }: {
      token: string;
      password: string;
    }) =>
      resetPassword(
        token,
        password
      ),

    onSuccess: (response) => {
      setSuccessMessage(
        response.message
      );
    },
  });

  const handleSubmit = (
    event: React.FormEvent
  ) => {
    event.preventDefault();

    setFormError("");
    setSuccessMessage("");

    if (!token) {
      setFormError(
        "This password reset link is invalid."
      );

      return;
    }

    if (password.length < 8) {
      setFormError(
        "Password must be at least 8 characters long."
      );

      return;
    }

    if (
      password !==
      confirmPassword
    ) {
      setFormError(
        "Passwords do not match."
      );

      return;
    }

    resetMutation.mutate({
      token,
      password,
    });
  };

  const handleSignIn = () => {
    navigate(
      "/login",
      {
        replace: true,
      }
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8">
      <div className="mx-auto flex min-h-[85vh] max-w-md items-center">
        <div className="w-full">
          {/* Brand */}

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

          {/* Card */}

          <div className="mt-8 rounded-2xl bg-white p-6 shadow-sm">
            {successMessage ? (
              <>
                <h1 className="text-2xl font-bold text-slate-900">
                  Password updated
                </h1>

                <div className="mt-5 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm leading-6 text-green-700">
                  {
                    successMessage
                  }
                </div>

                <p className="mt-4 text-sm leading-6 text-slate-500">
                  You can now sign in
                  using your mobile
                  number and new
                  password.
                </p>

                <button
                  type="button"
                  onClick={
                    handleSignIn
                  }
                  className="mt-6 w-full rounded-xl bg-[#2F80ED] px-4 py-3 font-semibold text-white transition hover:bg-[#1F6FD1]"
                >
                  Sign In
                </button>
              </>
            ) : (
              <form
                onSubmit={
                  handleSubmit
                }
              >
                <h1 className="text-2xl font-bold text-slate-900">
                  Set new password
                </h1>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Choose a new
                  password for your
                  Club100 account.
                </p>

                <div className="mt-6">
                  <label className="text-sm font-medium text-slate-700">
                    New Password
                  </label>

                  <input
                    type="password"
                    value={
                      password
                    }
                    onChange={(
                      event
                    ) =>
                      setPassword(
                        event
                          .target
                          .value
                      )
                    }
                    autoComplete="new-password"
                    placeholder="Minimum 8 characters"
                    className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-[#2F80ED]"
                  />
                </div>

                <div className="mt-5">
                  <label className="text-sm font-medium text-slate-700">
                    Confirm Password
                  </label>

                  <input
                    type="password"
                    value={
                      confirmPassword
                    }
                    onChange={(
                      event
                    ) =>
                      setConfirmPassword(
                        event
                          .target
                          .value
                      )
                    }
                    autoComplete="new-password"
                    placeholder="Enter password again"
                    className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-[#2F80ED]"
                  />
                </div>

                {formError && (
                  <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {
                      formError
                    }
                  </div>
                )}

                {resetMutation.isError && (
                  <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700">
                    This password
                    reset link may be
                    invalid, expired,
                    or already used.
                    Please request a
                    new reset link.
                  </div>
                )}

                <button
                  type="submit"
                  disabled={
                    resetMutation.isPending
                  }
                  className="mt-6 w-full rounded-xl bg-[#2F80ED] px-4 py-3 font-semibold text-white transition hover:bg-[#1F6FD1] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {resetMutation.isPending
                    ? "Updating Password..."
                    : "Set New Password"}
                </button>

                <p className="mt-6 text-center text-sm text-slate-500">
                  <Link
                    to="/login"
                    className="font-semibold text-[#2F80ED]"
                  >
                    Back to Sign In
                  </Link>
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}