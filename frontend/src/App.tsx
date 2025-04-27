import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home/home";
import Sign from "./pages/auth/sign";
import ClientDashboard from "./pages/dashboard/clientDashboard";
import FreelancerDashboard from "./pages/dashboard/freelancerDashboard";
import AdminSign from "./pages/auth/adminSign";
import AdminDashboard from "./pages/dashboard/adminDashboard";

export default function App() {
  return (
    <Router>
      <div>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/sign" element={<Sign />} />
          <Route path="/client/dashboard" element={<ClientDashboard />} />
          <Route path="/freelancer/dashboard" element={<FreelancerDashboard />} />
          <Route path="/admin/sign" element={<AdminSign />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
        </Routes>
      </div>
    </Router>
  );
}
