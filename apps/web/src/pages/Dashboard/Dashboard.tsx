import { Link, Route, Routes } from 'react-router-dom';
import { Building, Heart, Bell, CreditCard, User } from 'lucide-react';
import { useCurrentUser } from '../../hooks/useAuth';
import { useMyProperties, useSavedProperties } from '../../hooks/useProperties';
import { PropertyCard } from '../../components/Property/PropertyCard';
import { formatPrice } from '@metriva/shared';

function Overview() {
  const { data: user } = useCurrentUser();
  const { data: myProperties } = useMyProperties();
  const { data: saved } = useSavedProperties();

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">Dashboard</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'My Listings', value: myProperties?.length ?? 0, icon: Building, color: 'text-blue-600', href: '/dashboard/properties' },
          { label: 'Saved', value: saved?.length ?? 0, icon: Heart, color: 'text-red-500', href: '/dashboard/saved' },
          { label: 'Plan', value: user?.subscription?.plan ?? 'FREE', icon: CreditCard, color: 'text-purple-600', href: '/dashboard/subscription' },
          { label: 'Profile', value: user?.isEmailVerified ? '✓ Verified' : 'Unverified', icon: User, color: 'text-green-600', href: '/dashboard/profile' },
        ].map((stat) => (
          <Link key={stat.label} to={stat.href} className="bg-card border border-border rounded-2xl p-4 hover:shadow-md transition-all">
            <stat.icon className={`h-6 w-6 mb-2 ${stat.color}`} />
            <p className="text-xl font-bold">{stat.value}</p>
            <p className="text-sm text-muted-foreground">{stat.label}</p>
          </Link>
        ))}
      </div>
      <div>
        <h3 className="font-semibold mb-4">Recent Listings</h3>
        {myProperties?.length === 0
          ? <div className="text-center py-10 text-muted-foreground"><Link to="/post-property" className="text-brand-500 hover:underline">Post your first property →</Link></div>
          : <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">{myProperties?.slice(0, 3).map((p) => <PropertyCard key={p.id} property={p} />)}</div>
        }
      </div>
    </div>
  );
}

function SavedPage() {
  const { data: saved = [], isLoading } = useSavedProperties();
  return (
    <div>
      <h2 className="text-xl font-bold mb-6">Saved Properties ({saved.length})</h2>
      {saved.length === 0 && !isLoading
        ? <div className="text-center py-16 text-muted-foreground"><Heart className="h-12 w-12 mx-auto mb-3 opacity-30" /><p>No saved properties yet</p></div>
        : <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">{saved.map((p) => <PropertyCard key={p.id} property={p} />)}</div>
      }
    </div>
  );
}

export default function Dashboard() {
  const navLinks = [
    { to: '/dashboard', label: 'Overview', icon: Building, exact: true },
    { to: '/dashboard/saved', label: 'Saved', icon: Heart },
    { to: '/dashboard/notifications', label: 'Alerts', icon: Bell },
    { to: '/dashboard/payments', label: 'Payments', icon: CreditCard },
    { to: '/dashboard/profile', label: 'Profile', icon: User },
  ];

  return (
    <div className="container py-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <aside className="md:col-span-1">
          <nav className="space-y-1">
            {navLinks.map((link) => (
              <Link key={link.to} to={link.to} className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
                <link.icon className="h-4 w-4" />
                {link.label}
              </Link>
            ))}
          </nav>
        </aside>
        <main className="md:col-span-3">
          <Routes>
            <Route index element={<Overview />} />
            <Route path="saved" element={<SavedPage />} />
            <Route path="*" element={<div className="py-8 text-center text-muted-foreground">Coming soon</div>} />
          </Routes>
        </main>
      </div>
    </div>
  );
}
