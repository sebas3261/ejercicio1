import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import SignUp from "./pages/SignUp";
import { AuthProvider } from "./contexts/AuthContext";
import PrivateRoute from "./contexts/PrivateRoute";
import AdminHome from "./pages/AdminHome";
import EntrenosAdmin from "./pages/EntrenosAdmin";
import EntrenosUser from "./pages/EntrenosUser";
import TorneosAdmin from "./pages/TorneosAdmin";
import TorneosUser from "./pages/TorneosUser";
import InfoUser from "./pages/InfoUser";
import UserHome from "./pages/UserHome";
import "./css/main.css";

createRoot(document.getElementById("root")).render(
  <AuthProvider>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/admindashboard" element={<PrivateRoute type="admin"><AdminHome /></PrivateRoute>} />
        <Route path="/userdashboard" element={<PrivateRoute type="user"><UserHome /></PrivateRoute>} />
        <Route path="/entrenosAdmin" element={<PrivateRoute type="admin"><EntrenosAdmin /></PrivateRoute>} />
        <Route path="/entrenosUser" element={<PrivateRoute type="user"><EntrenosUser /></PrivateRoute>} />
        <Route path="/torneosAdmin" element={<PrivateRoute type="admin"><TorneosAdmin /></PrivateRoute>} />
        <Route path="/torneosUser" element={<PrivateRoute type="user"><TorneosUser /></PrivateRoute>} />
        <Route path="/infoUser" element={<PrivateRoute type="user"><InfoUser /></PrivateRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  </AuthProvider>
);
