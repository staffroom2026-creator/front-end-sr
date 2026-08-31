import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function PublicRoute({ children }) {
  const { user, token, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center bg-[#FAF9F6] text-gray-700">Loading...</div>;
  }

  if (token && user) {
    const role = user?.role || user?.user_role;
    const dashboardMap = {
      teacher: '/teacher-dashboard',
      school: '/school-dashboard',
      admin: '/admin-dashboard',
    };

    const redirectTo = dashboardMap[role] || '/';
    const from = location.state?.from || redirectTo;

    return <Navigate to={from} replace state={{ from: location.pathname }} />;
  }

  return children;
}
