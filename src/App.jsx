import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Sidebar from './components/Sidebar';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Movies from './pages/Movies';
import Theaters from './pages/Theaters';
import Shows from './pages/Shows';
import Bookings from './pages/Bookings';
import Users from './pages/Users';

const AdminLayout = ({ children }) => (
  <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
    <Sidebar />
    <main className="lg:ml-64 p-6 pt-16 lg:pt-6">{children}</main>
  </div>
);

const AppRoutes = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={isAuthenticated ? <Navigate to="/" replace /> : <Login />} />
      <Route path="/" element={<ProtectedRoute><AdminLayout><Dashboard /></AdminLayout></ProtectedRoute>} />
      <Route path="/movies" element={<ProtectedRoute><AdminLayout><Movies /></AdminLayout></ProtectedRoute>} />
      <Route path="/theaters" element={<ProtectedRoute><AdminLayout><Theaters /></AdminLayout></ProtectedRoute>} />
      <Route path="/shows" element={<ProtectedRoute><AdminLayout><Shows /></AdminLayout></ProtectedRoute>} />
      <Route path="/bookings" element={<ProtectedRoute><AdminLayout><Bookings /></AdminLayout></ProtectedRoute>} />
      <Route path="/users" element={<ProtectedRoute><AdminLayout><Users /></AdminLayout></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
          <Toaster position="top-right" />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
