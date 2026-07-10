import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import ReportIncident from "./pages/ReportIncident";
import Confirmation from "./pages/Confirmation";

// Simple route guard for demo
function ProtectedRoute({ children }) {
  const isAuth = localStorage.getItem("citizen_auth") === "true";
  if (!isAuth) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        <Route 
          path="/report" 
          element={
            <ProtectedRoute>
              <ReportIncident />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/confirmation" 
          element={
            <ProtectedRoute>
              <Confirmation />
            </ProtectedRoute>
          } 
        />

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
