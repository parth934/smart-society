import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ allowedRoles }) => {
  const { user } = useAuth();

  // 1. If the user is not logged in, kick them back to the login page
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // 2. If the user's role isn't allowed on this specific route, send them to their own dashboard
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={`/${user.role}`} replace />;
  }

  // 3. If everything is good, render the page they requested!
  return <Outlet />;
};

export default ProtectedRoute;