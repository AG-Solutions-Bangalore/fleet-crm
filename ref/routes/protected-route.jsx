import Page from "@/app/layout/page";
import DashboardSkeleton from "@/components/skeleton-loader/dashboard-skeleton";
import useAuth from "@/hooks/api/use-auth";
import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoute = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return <DashboardSkeleton />;

  return isAuthenticated ? (
    <Page>
      <Outlet />
    </Page>
  ) : (
    <Navigate to="/" replace />
  );
};

export default ProtectedRoute;
