import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { Building, Users, AlertTriangle, TrendingUp, CheckCircle, XCircle } from 'lucide-react';
import { formatPrice } from '@metriva/shared';

function useDashboardStats() {
  return useQuery({ queryKey: ['admin', 'dashboard'], queryFn: () => api.get('/admin/dashboard').then((r) => r.data.data) });
}

function usePendingProperties() {
  return useQuery({ queryKey: ['admin', 'pending-properties'], queryFn: () => api.get('/admin/properties/pending').then((r) => r.data.data) });
}

export default function AdminDashboard() {
  const { data: stats } = useDashboardStats();
  const { data: pending } = usePendingProperties();
  const queryClient = useQueryClient();

  const moderate = useMutation({
    mutationFn: ({ id, action }: { id: string; action: 'APPROVE' | 'REJECT' }) =>
      api.patch(`/admin/properties/${id}/moderate`, { action }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin'] });
    },
  });

  return (
    <div className="container py-8">
      <h1 className="text-2xl font-bold mb-8">Admin Dashboard</h1>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        {[
          { label: 'Total Users', value: stats?.totalUsers ?? '—', icon: Users, color: 'text-blue-600' },
          { label: 'Active Listings', value: stats?.activeProperties ?? '—', icon: Building, color: 'text-green-600' },
          { label: 'Pending Review', value: stats?.pendingReview ?? '—', icon: TrendingUp, color: 'text-amber-600' },
          { label: 'Fraud Reports', value: stats?.pendingFraudReports ?? '—', icon: AlertTriangle, color: 'text-red-600' },
        ].map((s) => (
          <div key={s.label} className="bg-card border border-border rounded-2xl p-5">
            <s.icon className={`h-6 w-6 mb-3 ${s.color}`} />
            <p className="text-2xl font-bold">{s.value}</p>
            <p className="text-sm text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Pending Review */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Properties Pending Review ({pending?.items?.length ?? 0})</h2>
        <div className="space-y-3">
          {pending?.items?.map((property: Record<string, unknown> & { id: string; title: string; city: string; owner: { firstName: string; lastName: string }; aiScore?: { trustScore: number } }) => (
            <div key={property.id} className="bg-card border border-border rounded-xl p-4 flex items-center justify-between gap-4">
              <div className="flex-1">
                <p className="font-medium">{property.title}</p>
                <p className="text-sm text-muted-foreground">{property.city} · Owner: {property.owner?.firstName} {property.owner?.lastName}</p>
                {property.aiScore && (
                  <p className="text-xs text-muted-foreground mt-0.5">AI Trust: {Math.round(property.aiScore.trustScore)}/100</p>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => moderate.mutate({ id: property.id, action: 'APPROVE' })}
                  disabled={moderate.isPending}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-50 text-green-700 border border-green-200 text-sm hover:bg-green-100 transition-colors"
                >
                  <CheckCircle className="h-4 w-4" /> Approve
                </button>
                <button
                  onClick={() => moderate.mutate({ id: property.id, action: 'REJECT' })}
                  disabled={moderate.isPending}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-50 text-red-700 border border-red-200 text-sm hover:bg-red-100 transition-colors"
                >
                  <XCircle className="h-4 w-4" /> Reject
                </button>
              </div>
            </div>
          ))}
          {pending?.items?.length === 0 && (
            <div className="py-10 text-center text-muted-foreground">All caught up! No pending reviews.</div>
          )}
        </div>
      </div>
    </div>
  );
}
