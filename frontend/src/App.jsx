import { Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import RangerDashboard from "./pages/RangerDashboard";
import EngineerDashboard from "./pages/EngineerDashboard";
import SupervisorDashboard from "./pages/SupervisorDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import Register from "./pages/Register";


export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/ranger" element={<RangerDashboard />} />
      <Route path="/engineer" element={<EngineerDashboard />} />
      <Route path="/supervisor" element={<SupervisorDashboard />} />
      <Route path="/admin" element={<AdminDashboard />} />
    </Routes>
  );
}
