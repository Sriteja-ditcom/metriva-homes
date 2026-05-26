import { lazy, Suspense } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { useAuthStore } from '../store/auth.store';
import { Layout } from '../components/Layout/Layout';

// Lazy-loaded pages — each becomes its own bundle chunk
const Home = lazy(() => import('../pages/Home/Home'));
const Properties = lazy(() => import('../pages/Properties/Properties'));
const PropertyDetail = lazy(() => import('../pages/PropertyDetail/PropertyDetail'));
const Login = lazy(() => import('../pages/Auth/Login'));
const Register = lazy(() => import('../pages/Auth/Register'));
const ForgotPassword = lazy(() => import('../pages/Auth/ForgotPassword'));
const Dashboard = lazy(() => import('../pages/Dashboard/Dashboard'));
const PostProperty = lazy(() => import('../pages/PostProperty/PostProperty'));
const AdminDashboard = lazy(() => import('../pages/Admin/AdminDashboard'));

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  return isAuthenticated ? <>{children}</> : <Navigate to="/auth/login" replace />;
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((s) => s.user);
  if (!user) return <Navigate to="/auth/login" replace />;
  if (user.role !== 'ADMIN') return <Navigate to="/" replace />;
  return <>{children}</>;
}

function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

export function AppRouter() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Public routes with main layout */}
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/properties" element={<Properties />} />
            <Route path="/properties/:id" element={<PropertyDetail />} />

            {/* Auth routes */}
            <Route path="/auth/login" element={<Login />} />
            <Route path="/auth/register" element={<Register />} />
            <Route path="/auth/forgot-password" element={<ForgotPassword />} />

            {/* Protected routes */}
            <Route path="/dashboard/*" element={
              <PrivateRoute><Dashboard /></PrivateRoute>
            } />
            <Route path="/post-property" element={
              <PrivateRoute><PostProperty /></PrivateRoute>
            } />

            {/* Admin routes */}
            <Route path="/admin/*" element={
              <AdminRoute><AdminDashboard /></AdminRoute>
            } />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
