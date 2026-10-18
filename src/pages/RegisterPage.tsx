import {
  useEffect,
  useState,
} from "react";
import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import {
  Link,
  useNavigate,
} from "react-router-dom";

import { captureAssessmentDestination, consumePostAuthDestination, assessmentAuthLink } from "../utils/postAuthDestination";

import {
  getRegistrationContext,
  register,
} from "../services/authService";

const REGISTRATION_TOKEN_STORAGE_KEY =
  "club100_app_registration_token";

export default function RegisterPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  captureAssessmentDestination(window.location.search);

  const [fullName, setFullName] =
    useState("");

  const [mobile, setMobile] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [registrationToken, setRegistrationToken] =
    useState("");

  const [handoffLoading, setHandoffLoading] =
    useState(false);

  const [handoffError, setHandoffError] =
    useState("");

  const [isPostPayment, setIsPostPayment] =
    useState(false);


  useEffect(() => {
    const params =
      new URLSearchParams(
        window.location.search
      );

    const urlToken =
      (params.get("token") || "").trim();

    if (urlToken) {
      sessionStorage.setItem(
        REGISTRATION_TOKEN_STORAGE_KEY,
        urlToken
      );

      window.history.replaceState(
        {},
        document.title,
        "/register"
      );
    }

    const token =
      urlToken ||
      (
        sessionStorage.getItem(
          REGISTRATION_TOKEN_STORAGE_KEY
        ) || ""
      ).trim();

    if (!token) {
      return;
    }

    setRegistrationToken(token);
    setIsPostPayment(true);
    setHandoffLoading(true);
    setHandoffError("");

    getRegistrationContext(token)
      .then((context) => {
        setFullName(
          context.fullName || ""
        );

        setMobile(
          context.mobile || ""
        );

        setEmail(
          context.email || ""
        );
      })
      .catch(() => {
        sessionStorage.removeItem(
          REGISTRATION_TOKEN_STORAGE_KEY
        );

        setRegistrationToken("");
        setHandoffError(
          "This account creation link is invalid or has expired. Please use a fresh link from Club100."
        );
      })
      .finally(() => {
        setHandoffLoading(false);
      });
  }, []);


  const registerMutation = useMutation({
    mutationFn: () =>
      register({
        fullName,
        mobile,
        email,
        password,
        registrationToken:
          registrationToken || undefined,
      }),

    onSuccess: (response) => {
      // Registration logs the member in on ERP. Discard cached Guest auth state
      // before entering protected onboarding/trial routes.
      queryClient.clear();
      sessionStorage.removeItem(
        REGISTRATION_TOKEN_STORAGE_KEY
      );

      if (
        response.member &&
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
        consumePostAuthDestination(),
        {
          replace: true,
        }
      );
    },
  });


  const passwordMismatch =
    Boolean(confirmPassword) &&
    password !== confirmPassword;

  const canSubmit =
    !handoffLoading &&
    !handoffError &&
    Boolean(fullName.trim()) &&
    Boolean(mobile.trim()) &&
    password.length >= 8 &&
    password === confirmPassword &&
    !registerMutation.isPending;


  const handleSubmit = (
    event: React.FormEvent
  ) => {
    event.preventDefault();

    if (!canSubmit) {
      return;
    }

    registerMutation.mutate();
  };


  if (handoffLoading) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-8">
        <div className="mx-auto flex min-h-[80vh] max-w-md items-center">
          <div className="w-full rounded-2xl bg-white p-6 text-center shadow-sm">
            <div className="text-3xl font-bold text-[#12395B]">
              Club
              <span className="text-[#2F80ED]">
                100
              </span>
            </div>

            <p className="mt-5 text-slate-600">
              Preparing your Club100 account...
            </p>
          </div>
        </div>
      </div>
    );
  }


  if (handoffError) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-8">
        <div className="mx-auto flex min-h-[80vh] max-w-md items-center">
          <div className="w-full rounded-2xl bg-white p-6 shadow-sm">
            <div className="text-center">
              <div className="text-3xl font-bold text-[#12395B]">
                Club
                <span className="text-[#2F80ED]">
                  100
                </span>
              </div>
            </div>

            <h1 className="mt-7 text-2xl font-bold text-slate-900">
              Account link unavailable
            </h1>

            <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {handoffError}
            </div>

            <Link
              to={assessmentAuthLink("/login")}
              className="mt-6 block w-full rounded-xl bg-[#2F80ED] px-4 py-3 text-center font-semibold text-white transition hover:bg-[#1F6FD1]"
            >
              Go to Sign In
            </Link>
          </div>
        </div>
      </div>
    );
  }


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
              {isPostPayment
                ? "Create your Club100 account"
                : "Create account"}
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              {isPostPayment
                ? "Your membership is active. Set your password to continue to onboarding."
                : "Create your Club100 account to get started."}
            </p>

            {isPostPayment && (
              <div className="mt-5 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">
                Your enrollment is already confirmed. We have prefilled your member details from Club100 ERP.
              </div>
            )}

            <div className="mt-6">
              <label className="text-sm font-medium text-slate-700">
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
                readOnly={isPostPayment}
                autoComplete="name"
                placeholder="Enter full name"
                className={
                  "mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-[#2F80ED] " +
                  (
                    isPostPayment
                      ? "bg-slate-50 text-slate-700"
                      : "bg-white"
                  )
                }
              />
            </div>

            <div className="mt-5">
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
                readOnly={isPostPayment}
                autoComplete="tel"
                placeholder="Enter mobile number"
                className={
                  "mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-[#2F80ED] " +
                  (
                    isPostPayment
                      ? "bg-slate-50 text-slate-700"
                      : "bg-white"
                  )
                }
              />
            </div>

            <div className="mt-5">
              <label className="text-sm font-medium text-slate-700">
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
                autoComplete="email"
                placeholder="Enter email"
                className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-[#2F80ED]"
              />

              {isPostPayment && (
                <p className="mt-2 text-xs text-slate-500">
                  You can update your email before creating the account.
                </p>
              )}
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
                value={confirmPassword}
                onChange={(event) =>
                  setConfirmPassword(
                    event.target.value
                  )
                }
                autoComplete="new-password"
                placeholder="Re-enter password"
                className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-[#2F80ED]"
              />

              {passwordMismatch && (
                <p className="mt-2 text-xs font-medium text-red-600">
                  Passwords do not match.
                </p>
              )}
            </div>

            {registerMutation.isError && (
              <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                We could not create your Club100 account. Please check your details or use a fresh account-creation link.
              </div>
            )}

            <button
              type="submit"
              disabled={!canSubmit}
              className="mt-6 w-full rounded-xl bg-[#2F80ED] px-4 py-3 font-semibold text-white transition hover:bg-[#1F6FD1] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {registerMutation.isPending
                ? "Creating Account..."
                : "Create Account"}
            </button>

            {!isPostPayment && (
              <p className="mt-6 text-center text-sm text-slate-500">
                Already have an account?{" "}
                <Link
                  to={assessmentAuthLink("/login")}
                  className="font-semibold text-[#2F80ED]"
                >
                  Sign In
                </Link>
              </p>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
