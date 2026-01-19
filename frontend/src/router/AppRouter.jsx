import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "../pages/LoginPage";
import DashboardPage from "../pages/DashboardPage";
import ResourceFormPage from "../pages/ResourceFormPage";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/resources/new" element={<ResourceFormPage />} />
        <Route path="/" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}

const isAuthenticated = () => {
  return !!localStorage.getItem("token");
};

<Route
  path="/dashboard"
  element={
    isAuthenticated() ? <DashboardPage /> : <Navigate to="/login" />
  }
/>
