import { useState, useEffect } from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import Incidents from "@/pages/Incidents";
import Activities from "@/pages/Activities";
import Missing from "@/pages/Missing";
import SOS from "@/pages/SOS";
import Volunteers from "@/pages/Volunteers";
import Profile from "@/pages/Profile";
import Intelligence from "@/pages/Intelligence";
import Geographic from "@/pages/Geographic";
import Notifications from "@/pages/Notifications";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/context/ThemeContext";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('pfa_token');
    if (token) {
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-app flex items-center justify-center">
        <div className="text-primary font-heading text-xl">LOADING...</div>
      </div>
    );
  }

  return (
    <ThemeProvider>
      <div className="App">
        <BrowserRouter>
          <Routes>
          <Route 
            path="/login" 
            element={
              isAuthenticated ? 
              <Navigate to="/" replace /> : 
              <Login setIsAuthenticated={setIsAuthenticated} />
            } 
          />
          <Route 
            path="/" 
            element={
              isAuthenticated ? 
              <Dashboard /> : 
              <Navigate to="/login" replace />
            } 
          />
          <Route 
            path="/incidents" 
            element={
              isAuthenticated ? 
              <Incidents /> : 
              <Navigate to="/login" replace />
            } 
          />
          <Route 
            path="/activities" 
            element={
              isAuthenticated ? 
              <Activities /> : 
              <Navigate to="/login" replace />
            } 
          />
          <Route 
            path="/missing" 
            element={
              isAuthenticated ? 
              <Missing /> : 
              <Navigate to="/login" replace />
            } 
          />
          <Route 
            path="/sos" 
            element={
              isAuthenticated ? 
              <SOS /> : 
              <Navigate to="/login" replace />
            } 
          />
          <Route 
            path="/volunteers" 
            element={
              isAuthenticated ? 
              <Volunteers /> : 
              <Navigate to="/login" replace />
            } 
          />
          <Route 
            path="/profile" 
            element={
              isAuthenticated ? 
              <Profile /> : 
              <Navigate to="/login" replace />
            } 
          />
          <Route 
            path="/intelligence" 
            element={
              isAuthenticated ? 
              <Intelligence /> : 
              <Navigate to="/login" replace />
            } 
          />
          <Route 
            path="/geographic" 
            element={
              isAuthenticated ? 
              <Geographic /> : 
              <Navigate to="/login" replace />
            } 
          />
          <Route 
            path="/notifications" 
            element={
              isAuthenticated ? 
              <Notifications /> : 
              <Navigate to="/login" replace />
            } 
          />
        </Routes>
      </BrowserRouter>
      <Toaster position="top-center" />
    </div>
    </ThemeProvider>
  );
}

export default App;