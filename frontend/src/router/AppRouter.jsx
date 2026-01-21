import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import HomeRedirect from "./HomeRedirect";
import ProtectedRoute from "./ProtectedRoute";

import LoginPage from "../pages/LoginPage";
import DashboardPage from "../pages/DashboardPage";
import ResourceFormPage from "../pages/ResourceFormPage";
import SignupPage from "../pages/SignupPage";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ✅ Home intelligent */}
        <Route path="/" element={<HomeRedirect />} />

        {/* ✅ Routes publiques */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />

        {/* ✅ Routes protégées */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/resources/new"
          element={
            <ProtectedRoute>
              <ResourceFormPage />
            </ProtectedRoute>
          }
        />

        {/* ✅ Le catch-all doit aller vers login (pas dashboard) */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
