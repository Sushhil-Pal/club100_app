import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "../../pages/LoginPage";
import DashboardPage from "../../pages/DashboardPage";
import SchedulePage from "../../pages/SchedulePage";
import ProgressPage from "../../pages/ProgressPage";
import SessionPage from "../../pages/SessionPage";
import FeedbackPage from "../../pages/FeedbackPage";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/schedule" element={<SchedulePage />} />
        <Route path="/progress" element={<ProgressPage />} />
        <Route path="/session/:id" element={<SessionPage />} />
        <Route path="/feedback/:sessionId" element={<FeedbackPage />} />
      </Routes>
    </BrowserRouter>
  );
}