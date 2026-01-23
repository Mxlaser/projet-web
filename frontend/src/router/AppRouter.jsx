import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "../pages/LoginPage";
import SignupPage from "../pages/SignupPage";
import ResourceListPage from "../pages/ResourceListPage";
import DashboardPage from "../pages/DashboardPage";
import ResourceFormPage from "../pages/ResourceFormPage";
import CalendarPage from "../pages/CalendarPage";
import ProtectedRoute from "./ProtectedRoute";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route
          path="/resources"
          element={
            <ProtectedRoute>
              <ResourceListPage />
            </ProtectedRoute>
          }
        />
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
        <Route
          path="/resources/:id/edit"
          element={
            <ProtectedRoute>
              <ResourceFormPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/calendar"
          element={
            <ProtectedRoute>
              <CalendarPage />
            </ProtectedRoute>
          }
        />
        <Route path="/" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}
