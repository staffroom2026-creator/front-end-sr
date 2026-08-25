import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, allowedRoles = [] }) {
  const { user, token, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center bg-[#FAF9F6] text-gray-700">Loading...</div>;
  }

  if (!token || !user) {
    return <Navigate to="/signin" replace state={{ from: location.pathname }} />;
  }

  const role = user?.role || user?.user_role;

  if (allowedRoles.length && !allowedRoles.includes(role)) {
    return <Navigate to="/signin" replace state={{ from: location.pathname }} />;
  }

  return children;
}
