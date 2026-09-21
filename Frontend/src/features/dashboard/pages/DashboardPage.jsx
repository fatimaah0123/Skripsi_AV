import React from 'react';
import { LayoutDashboard, RefreshCw } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import useDashboard from '../hooks/useDashboard';
import SummaryCard from '../components/SummaryCard';
import TrendCard from '../components/TrendCard';
import AssetTable from '../components/AssetTable';

const DashboardPage = () => {
  const { user }                            = useAuth();
  const { dashboardData, isLoading, error } = useDashboard();

  const hasValidChartData = dashboardData && 
    (dashboardData.machine_status || 
     dashboardData.engineer_status || 
     dashboardData.ticket_status || 
     dashboardData.monthly_maintenance || 
     dashboardData.failure_types);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <LayoutDashboard size={22} className="text-blue-500" />
        <div>
          <h1 className="text-xl font-black text-stone-900 dark:text-white tracking-tight">
            Dashboard Monitoring
          </h1>
          <p className="text-xs text-stone-600 dark:text-stone-300 mt-0.5">
            Selamat datang, <span className="font-semibold">{user?.name}</span>
            {user?.role && (
              <span className="ml-2 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
                {user.role}
              </span>
            )}
          </p>
        </div>
      </div>

      {isLoading && (
        <div className="p-12 text-center rounded-2xl bg-white dark:bg-stone-900 border border-stone-100 dark:border-stone-800">
          <RefreshCw className="animate-spin text-blue-500 mx-auto mb-3" size={28} />
          <p className="text-sm font-semibold text-stone-700 dark:text-stone-300">
            Memuat data dashboard...
          </p>
        </div>
      )}

      {error && !isLoading && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm font-medium">
          {error}
        </div>
      )}

      {!isLoading && !error && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <SummaryCard
              title="Total Mesin Industri"
              value={dashboardData?.summary?.total_machines}
              type="machines"
            />
            <SummaryCard
              title="Tiket Pemeliharaan Aktif"
              value={dashboardData?.summary?.active_tickets}
              type="tickets"
            />
          </div>

          {hasValidChartData ? (
            <TrendCard
              machineStatus={dashboardData?.machine_status ?? []}
              engineerStatus={dashboardData?.engineer_status ?? []}
              ticketStatus={dashboardData?.ticket_status ?? []}
              monthlyMaintenance={dashboardData?.monthly_maintenance ?? []}
              failureTypes={dashboardData?.failure_types ?? []}
            />
          ) : (
            <div className="p-8 text-center text-sm text-stone-600 dark:text-stone-300 bg-white dark:bg-stone-900 rounded-2xl border border-stone-100 dark:border-stone-800">
              Data grafik analitik tidak tersedia atau format tidak sesuai.
            </div>
          )}

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
            <AssetTable
              title="5 Mesin Paling Kritis (RUL Terendah)"
              data={dashboardData?.critical_machines ?? []}
              type="critical"
            />
            <AssetTable
              title="5 Mesin dengan Prediksi Kerusakan Tertinggi"
              data={dashboardData?.problematic_machines ?? []}
              type="problematic"
            />
            <div className="xl:col-span-2">
              <AssetTable
                title="Daftar Tiket Pemeliharaan Terbaru"
                data={dashboardData?.latest_tickets ?? []}
                type="latest"
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default DashboardPage;