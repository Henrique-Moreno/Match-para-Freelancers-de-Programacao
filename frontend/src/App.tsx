import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home/home";
import Sign from "./pages/auth/sign";
import ClientDashboard from "./pages/dashboard/clientDashboard";
import FreelancerDashboard from "./pages/dashboard/freelancerDashboard";
import AdminSign from "./pages/auth/adminSign";
import AdminDashboard from "./pages/dashboard/adminDashboard";
import { AuthProvider } from "./contexts/AuthContext";
import ErrorBoundary from "./components/ErrorBoundary";

function NotFound() {
  return <h1>404 - Página não encontrada</h1>;
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <ErrorBoundary>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/sign" element={<Sign />} />
            <Route path="/client/dashboard" element={<ClientDashboard />} />
            <Route path="/freelancer/dashboard" element={<FreelancerDashboard />} />
            <Route path="/admin/sign" element={<AdminSign />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </ErrorBoundary>
      </AuthProvider>
    </Router>
  );
}