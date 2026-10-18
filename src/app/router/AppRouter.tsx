import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import AppShell from "../../components/layout/AppShell";
import MemberMembershipLayout from "../../components/layout/MemberMembershipLayout";
import TrainerAppShell from "../../components/layout/TrainerAppShell";

import ProtectedRoute from "../../components/auth/ProtectedRoute";
import MemberRoute from "../../components/auth/MemberRoute";
import MembershipRequiredRoute from "../../components/auth/MembershipRequiredRoute";
import TrainerRoute from "../../components/auth/TrainerRoute";
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
import SelfWorkoutDetailPage from "../../pages/SelfWorkoutDetailPage";
import SelfWorkoutScheduleSettingsPage from "../../pages/SelfWorkoutScheduleSettingsPage";
import FeedbackPage from "../../pages/FeedbackPage";

import TrainerTodayPage from "../../pages/trainer/TrainerTodayPage";
import TrainerMembersPage from "../../pages/trainer/TrainerMembersPage";
import TrainerAssessmentsPage from "../../pages/trainer/TrainerAssessmentsPage";
import TrainerSessionsPage from "../../pages/trainer/TrainerSessionsPage";
import TrainerProfilePage from "../../pages/trainer/TrainerProfilePage";
import TrainerMemberDetailPage from "../../pages/trainer/TrainerMemberDetailPage";
import TrainerStartAssessmentPage from "../../pages/trainer/TrainerStartAssessmentPage";
import TrainerAssessmentPage from "../../pages/trainer/TrainerAssessmentPage";
import TrainerAssessmentResultPage from "../../pages/trainer/TrainerAssessmentResultPage";
import TrainerSessionDetailPage from "../../pages/trainer/TrainerSessionDetailPage";
import MemberAssessmentResultPage from "../../pages/MemberAssessmentResultPage";
import SelfAssessmentHomePage from "../../pages/SelfAssessmentHomePage";
import SelfAssessmentPage from "../../pages/SelfAssessmentPage";
import FreeTrialPage from "../../pages/FreeTrialPage";
import MembershipPlansPage from "../../pages/MembershipPlansPage";
import MemberCheckoutPage from "../../pages/MemberCheckoutPage";
import PurchaseHistoryPage from "../../pages/PurchaseHistoryPage";

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
            Member onboarding

            Authenticated + member role required.
            Completion is NOT required to access onboarding.
        ================================================== */}

        <Route
          element={
            <ProtectedRoute>
              <MemberRoute />
            </ProtectedRoute>
          }
        >
          <Route
            path="/onboarding"
            element={<OnboardingPage />}
          />
        </Route>

        {/* ==================================================
            Member application
        ================================================== */}

        <Route
          element={
            <ProtectedRoute>
              <MemberRoute />
            </ProtectedRoute>
          }
        >
          <Route element={<OnboardingGuard />}>
            <Route element={<MemberMembershipLayout />}>
            {/* ==============================================
                Member application shell
            ============================================== */}

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
                element={<MembershipRequiredRoute><SchedulePage /></MembershipRequiredRoute>}
              />
              <Route path="/self-schedule/:enrollmentId" element={<MembershipRequiredRoute><SelfWorkoutScheduleSettingsPage /></MembershipRequiredRoute>} />
              <Route path="/self-workout/:id" element={<MembershipRequiredRoute><SelfWorkoutDetailPage /></MembershipRequiredRoute>} />

              <Route
                path="/progress"
                element={<MembershipRequiredRoute><ProgressPage /></MembershipRequiredRoute>}
              />

              <Route
                path="/progress/:assessmentId"
                element={
                    <MemberAssessmentResultPage />
                }
                />

              <Route path="/free-assessment" element={<SelfAssessmentHomePage />} />
              <Route path="/free-trial" element={<FreeTrialPage />} />
              <Route path="/free-assessment/:assessmentId" element={<SelfAssessmentPage />} />

              <Route
                path="/assessment"
                element={<SelfAssessmentHomePage />}
              />

              <Route
                path="/assessment/:assessmentId"
                element={<SelfAssessmentPage />}
              />

              <Route
                path="/program"
                element={<MembershipRequiredRoute><ProgramPage /></MembershipRequiredRoute>}
              />

              <Route path="/membership-plans" element={<MembershipPlansPage />} />
              <Route path="/membership-checkout" element={<MemberCheckoutPage />} />
              <Route path="/my-purchases" element={<PurchaseHistoryPage />} />

              <Route
                path="/profile"
                element={<ProfilePage />}
              />
            </Route>

            {/* ==============================================
                Member immersive routes
            ============================================== */}



            <Route
              path="/session/:id"
              element={<MembershipRequiredRoute><SessionPage /></MembershipRequiredRoute>}
            />

            <Route
              path="/feedback/:sessionId"
              element={<MembershipRequiredRoute><FeedbackPage /></MembershipRequiredRoute>}
            />
            </Route>
          </Route>
        </Route>

        {/* ==================================================
            Trainer application
        ================================================== */}

        <Route
          element={
            <ProtectedRoute>
              <TrainerRoute />
            </ProtectedRoute>
          }
        >
          <Route element={<TrainerAppShell />}>
            <Route
              path="/trainer"
              element={<TrainerTodayPage />}
            />

            <Route
              path="/trainer/members"
              element={<TrainerMembersPage />}
            />

            <Route
              path="/trainer/assessments"
              element={<TrainerAssessmentsPage />}
            />

            <Route
              path="/trainer/sessions"
              element={<TrainerSessionsPage />}
            />

            <Route
              path="/trainer/profile"
              element={<TrainerProfilePage />}
            />
            <Route
                path="/trainer/members/:memberId"
                element={
                    <TrainerMemberDetailPage />
                }
                />
            <Route
                path="/trainer/assessment/new"
                element={
                    <TrainerStartAssessmentPage />
                }
                />

            <Route
                path="/trainer/assessment/:assessmentId"
                element={
                    <TrainerAssessmentPage />
                }
                />
            <Route
                path="/trainer/assessment/:assessmentId/result"
                element={
                    <TrainerAssessmentResultPage />
                }
                />

            <Route
                path="/trainer/session/:sessionId"
                element={
                    <TrainerSessionDetailPage />
                }
                />
          </Route>

          
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