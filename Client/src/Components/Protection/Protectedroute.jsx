import { Link, Navigate, Outlet, useOutletContext } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import Loading from '../Layout/Loading';

function AccessDenied() {
  return (
    <main role="alert" className="min-h-screen flex flex-col items-center justify-center gap-3 p-6 text-center">
      <h1 className="text-xl font-bold">403 — Access denied</h1>
      <p>Your account does not have permission to view this page.</p>
      <Link to="/" className="underline">Return home</Link>
    </main>
  );
}

export default function ProtectedRoute({ roles }) {
  const inheritedUser = useOutletContext();
  const { user: serverUser, status } = useAuth();
  const user = inheritedUser || serverUser;

  if (status === 'guest') return <Navigate to="/login" replace />;
  if (status === 'loading' || status === 'refreshing') {
    return <Loading />;
  }
  if (status === 'error' && !user) {
    return <main role="alert" className="min-h-screen flex items-center justify-center p-6 text-center">
      Unable to verify your account. Please try again.
    </main>;
  }
  if (!user) return <Loading />;

  if (roles && !roles.includes(user.role)) return <AccessDenied />;
  return <Outlet context={user} />;
}
