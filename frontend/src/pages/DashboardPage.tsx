import { useQuery } from "@tanstack/react-query";
import { inventoryApi } from "@/api";
import { StatCard } from "@/components/StatCard";
import { PageHeader } from "@/components/PageHeader";
import { LoadingSpinner } from "@/components/LoadingSpinner";

export function DashboardPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: () => inventoryApi.dashboardStats().then((r) => r.data),
  });

  if (isLoading) return <LoadingSpinner />;
  if (error) {
    return (
      <div className="card text-center text-red-600">
        Failed to load dashboard data. Ensure the backend is running.
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Overview of your inventory and order management system"
      />
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Products" value={data?.total_products ?? 0} icon="📦" color="blue" />
        <StatCard title="Total Customers" value={data?.total_customers ?? 0} icon="👥" color="green" />
        <StatCard title="Total Orders" value={data?.total_orders ?? 0} icon="🛒" color="purple" />
        <StatCard title="Low Stock Products" value={data?.low_stock_products ?? 0} icon="⚠️" color="orange" />
      </div>
    </div>
  );
}
