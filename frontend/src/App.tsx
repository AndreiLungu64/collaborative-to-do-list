/**
 * @module App
 * @description Main application component with routing.
 */
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Calendar from './pages/Calendar';

const App = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

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
            path="/calendar"
            element={
              <ProtectedRoute>
                <Calendar />
              </ProtectedRoute>
            }
          />

          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>

        {/* Global toast notifications */}
        <Toaster
          position="bottom-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#2d3449',
              color: '#dae2fd',
              fontFamily: 'Inter, sans-serif',
              fontSize: '0.875rem',
              border: '1px solid rgba(70, 69, 84, 0.3)',
              borderRadius: '0.75rem',
            },
            success: {
              iconTheme: { primary: '#22c55e', secondary: '#0b1326' },
            },
            error: {
              iconTheme: { primary: '#ffb4ab', secondary: '#0b1326' },
            },
          }}
        />
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
