
import React, { useContext, useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation
} from "react-router-dom";

import { AnimatePresence } from "framer-motion";

import CollegeForMe from "./pages/CollegeForMe";

import { AuthContext } from "./context/AuthContext";
import { SearchProvider } from "./context/SearchContext";

import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import Chatbot from "./components/Chatbot";
import StudentProfile from "./components/StudentProfile";

import SignIn from "./pages/SignIn";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Compare from "./pages/Compare";
import CollegeDetail from "./pages/CollegeDetail";
import AdminDashboard from "./pages/AdminDashboard";
import AddReview from "./pages/AddReview";

import AdminRoute from "./components/AdminRoute";

/* =====================================================
   PROTECTED HOME
===================================================== */
function ProtectedHome({ children }) {
  const { user } = useContext(AuthContext);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

/* =====================================================
   ANIMATED ROUTES
===================================================== */
function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>

        {/* Home */}
        <Route
          path="/"
          element={
            <ProtectedHome>
              <Home />
            </ProtectedHome>
          }
        />

        {/* Auth Pages */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/signin" element={<SignIn />} />

        {/* Main Pages */}
        <Route path="/compare" element={<Compare />} />
        <Route path="/college/:id" element={<CollegeDetail />} />
        <Route path="/college/:id/review" element={<AddReview />} />
        <Route path="/college-for-me" element={<CollegeForMe />} />

        {/* Admin Dashboard */}
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          }
        />

        {/* Optional direct dashboard route */}
        <Route
          path="/dashboard"
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          }
        />

        {/* Fallback Route */}
        <Route
          path="*"
          element={<Navigate to="/" replace />}
        />

      </Routes>
    </AnimatePresence>
  );
}

/* =====================================================
   APP ROOT
===================================================== */
export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  return (
    <SearchProvider>
      <BrowserRouter>

        <Navbar
          setSidebarOpen={setSidebarOpen}
          setProfileOpen={setProfileOpen}
        />

        <Sidebar
          open={sidebarOpen}
          setOpen={setSidebarOpen}
        />

        {/* Student Profile Panel */}
        <StudentProfile
          open={profileOpen}
          onClose={() => setProfileOpen(false)}
        />

        <AnimatedRoutes />

        <Chatbot />

      </BrowserRouter>
    </SearchProvider>
  );
}
