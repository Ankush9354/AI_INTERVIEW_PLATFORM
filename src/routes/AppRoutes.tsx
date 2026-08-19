import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "../components/auth/ProtectedRoute";

import Home from "../pages/Home";
import Login from "../pages/Login";
import Signup from "../pages/Signup";
import NotFound from "../pages/NotFound";
import Dashboard from "../pages/Dashboard";
import Resume from "../pages/Resume";
import Interview from "../pages/Interview";
import MockInterview from "../pages/MockInterview";
import InterviewResult from "../pages/InterviewResult";

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Home />} />

      <Route path="/login" element={<Login />} />

      <Route path="/signup" element={<Signup />} />

      {/* Protected Routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/resume"
        element={
          <ProtectedRoute>
            <Resume />
          </ProtectedRoute>
        }
      />

      <Route
        path="/interview"
        element={
          <ProtectedRoute>
            <Interview />
          </ProtectedRoute>
        }
      />

      <Route
        path="/mock-interview"
        element={
          <ProtectedRoute>
            <MockInterview />
          </ProtectedRoute>
        }
      />

      <Route
        path="/interview-result"
        element={
          <ProtectedRoute>
            <InterviewResult />
          </ProtectedRoute>
        }
      />

      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;