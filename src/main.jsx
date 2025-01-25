import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router";
import Home from "./pages/Home";
import SignUp from "./pages/SignUp";
import { AuthProvider } from "./contexts/AuthContext";
import PrivateRoute from "./contexts/PrivateRoute";
import AdminHome from "./pages/AdminHome";
import EntrenosAdmin from "./pages/EntrenosAdmin";
import UserHome from "./pages/UserHome";
import "./css/main.css"

createRoot(document.getElementById("root")).render(
  <AuthProvider>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/admindashboard" element={<PrivateRoute type="admin"><AdminHome/></PrivateRoute>}/>
        <Route path="/userdashboard" element={<PrivateRoute type="user"><UserHome/></PrivateRoute>}/>
        <Route path="/entrenosAdmin" element={<PrivateRoute type="admin"><EntrenosAdmin/></PrivateRoute>}/>
        <Route path="*" element={<Navigate to="/" replace/>} />
      </Routes>
    </BrowserRouter>
  </AuthProvider>
);
