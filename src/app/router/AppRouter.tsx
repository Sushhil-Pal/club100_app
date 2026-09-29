import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import AppShell from "../../components/layout/AppShell";

import ProtectedRoute from "../../components/auth/ProtectedRoute";
import OnboardingGuard from "../../components/auth/OnboardingGuard";

import LoginPage from "../../pages/LoginPage";
import RegisterPage from "../../pages/RegisterPage";
import ForgotPasswordPage from "../../pages/ForgotPasswordPage";
import ResetPasswordPage from "../../pages/ResetPasswordPage";

import OnboardingPage from "../../pages/OnboardingPage";

import DashboardPage from "../../pages/DashboardPage";
import SchedulePage from "../../pages/SchedulePage";
import ProgressPage from "../../pages/ProgressPage";
import ProgramPage from "../../pages/ProgramPage";
import ProfilePage from "../../pages/ProfilePage";

import SessionPage from "../../pages/SessionPage";
import FeedbackPage from "../../pages/FeedbackPage";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ==================================================
            Public authentication routes
        ================================================== */}

        <Route
          path="/login"
          element={<LoginPage />}
        />

        <Route
          path="/register"
          element={<RegisterPage />}
        />

        <Route
          path="/forgot-password"
          element={<ForgotPasswordPage />}
        />

        <Route
          path="/reset-password/:token"
          element={<ResetPasswordPage />}
        />

        {/* ==================================================
            Onboarding

            Must be authenticated, but onboarding does NOT
            need to be completed to access this page.
        ================================================== */}

        <Route
          path="/onboarding"
          element={
            <ProtectedRoute>
              <OnboardingPage />
            </ProtectedRoute>
          }
        />

        {/* ==================================================
            Authenticated + onboarding completed routes
        ================================================== */}

        <Route
          element={
            <ProtectedRoute>
              <OnboardingGuard />
            </ProtectedRoute>
          }
        >
          {/* ================================================
              Main application shell
          ================================================ */}

          <Route element={<AppShell />}>
            <Route
              path="/"
              element={
                <Navigate
                  to="/dashboard"
                  replace
                />
              }
            />

            <Route
              path="/dashboard"
              element={<DashboardPage />}
            />

            <Route
              path="/schedule"
              element={<SchedulePage />}
            />

            <Route
              path="/progress"
              element={<ProgressPage />}
            />

            <Route
              path="/program"
              element={<ProgramPage />}
            />

            <Route
              path="/profile"
              element={<ProfilePage />}
            />
          </Route>

          {/* ================================================
              Immersive routes

              These intentionally sit outside AppShell.
          ================================================ */}

          <Route
            path="/session/:id"
            element={<SessionPage />}
          />

          <Route
            path="/feedback/:sessionId"
            element={<FeedbackPage />}
          />
        </Route>

        {/* ==================================================
            Fallback
        ================================================== */}

        <Route
          path="*"
          element={
            <Navigate
              to="/"
              replace
            />
          }
        />
      </Routes>
    </BrowserRouter>
  );
}