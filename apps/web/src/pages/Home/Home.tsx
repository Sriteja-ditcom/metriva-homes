import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Building2, MapPin, Search, Shield, Sparkles, TrendingUp } from 'lucide-react';
import { useFeaturedProperties } from '../../hooks/useProperties';
import { PropertyCard, PropertyCardSkeleton } from '../../components/Property/PropertyCard';
import { MAJOR_CITIES, LISTING_TYPE_LABELS } from '@metriva/shared';

const STATS = [
  { label: 'Verified Listings', value: '50,000+', icon: Shield },
  { label: 'Happy Customers', value: '25,000+', icon: Building2 },
  { label: 'Cities', value: '20+', icon: MapPin },
  { label: 'Properties Sold', value: '5,000+', icon: TrendingUp },
];

export default function Home() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'BUY' | 'RENT' | 'COMMERCIAL'>('BUY');
  const [searchQuery, setSearchQuery] = useState('');

  const { data: featured, isLoading } = useFeaturedProperties();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams({
      listingType: activeTab,
      ...(searchQuery && { query: searchQuery }),
    });
    navigate(`/properties?${params.toString()}`);
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-brand-900 via-brand-700 to-brand-500 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(255,255,255,0.3),transparent_50%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(255,255,255,0.2),transparent_50%)]" />
        </div>

        <div className="container relative py-24 md:py-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-4xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-sm mb-6">
              <Sparkles className="h-4 w-4 text-amber-300" />
              <span>AI-Powered Trust Verification</span>
            </div>

            <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6">
              Find Your Perfect
              <span className="text-amber-300"> Home</span>,
              <br />
              Without the Fraud
            </h1>

            <p className="text-lg md:text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
              Every listing verified by AI. Every owner checked. Every transaction protected.
              India's most trusted real estate platform.
            </p>

            {/* Search Box */}
            <div className="bg-white rounded-2xl p-2 shadow-2xl max-w-3xl mx-auto">
              {/* Tab switcher */}
              <div className="flex gap-1 mb-2 p-1 bg-muted rounded-xl">
                {(['BUY', 'RENT', 'COMMERCIAL'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                      activeTab === tab
                        ? 'bg-white text-brand-700 shadow-sm'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {LISTING_TYPE_LABELS[tab]}
                  </button>
                ))}
              </div>

              <form onSubmit={handleSearch} className="flex gap-2">
                <div className="flex-1 flex items-center gap-3 px-4 py-3 rounded-xl border border-border bg-background">
                  <Search className="h-4 w-4 text-muted-foreground shrink-0" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search city, locality, project name..."
                    className="flex-1 text-sm bg-transparent outline-none text-foreground placeholder:text-muted-foreground"
                  />
                </div>
                <button
                  type="submit"
                  className="px-6 py-3 rounded-xl bg-brand-500 text-white font-semibold hover:bg-brand-600 transition-colors flex items-center gap-2"
                >
                  Search
                  <ArrowRight className="h-4 w-4" />
                </button>
              </form>

              {/* Popular cities */}
              <div className="flex items-center gap-2 px-2 pt-2 pb-1 flex-wrap">
                <span className="text-xs text-muted-foreground">Popular:</span>
                {MAJOR_CITIES.slice(0, 8).map((city) => (
                  <button
                    key={city}
                    onClick={() => navigate(`/properties?city=${city}&listingType=${activeTab}`)}
                    className="text-xs text-brand-600 hover:text-brand-700 hover:underline transition-colors"
                  >
                    {city}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-b border-border bg-muted/30">
        <div className="container py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {STATS.map((stat) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <stat.icon className="h-6 w-6 text-brand-500 mx-auto mb-2" />
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Properties */}
      <section className="container py-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold">Featured Properties</h2>
            <p className="text-muted-foreground mt-1">AI-verified listings with highest trust scores</p>
          </div>
          <button
            onClick={() => navigate('/properties?isFeatured=true')}
            className="flex items-center gap-2 text-brand-500 hover:text-brand-600 font-medium text-sm transition-colors"
          >
            View all <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {isLoading
            ? Array.from({ length: 8 }).map((_, i) => <PropertyCardSkeleton key={i} />)
            : featured?.map((property) => (
                <PropertyCard key={property.id} property={property} variant="featured" />
              ))}
        </div>
      </section>

      {/* Trust Section */}
      <section className="bg-muted/30 border-y border-border py-16">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold mb-3">Why Trust Metriva Homes?</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              We use AI to verify every listing, detect fraud, and give you the confidence to transact safely.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[
              {
                icon: Shield,
                title: 'AI Trust Score',
                desc: 'Every listing gets an AI-generated trust score based on 20+ signals. You see the risk before you contact.',
                color: 'text-green-600',
              },
              {
                icon: Sparkles,
                title: 'Fraud Detection',
                desc: 'Our AI detects duplicate listings, price anomalies, and suspicious seller patterns before they reach you.',
                color: 'text-blue-600',
              },
              {
                icon: Building2,
                title: 'Verified Owners',
                desc: 'RERA-verified builders, KYC-checked brokers, and document-verified sellers — every badge is earned.',
                color: 'text-purple-600',
              },
            ].map((feature) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="bg-card rounded-2xl border border-border p-6"
              >
                <feature.icon className={`h-8 w-8 mb-4 ${feature.color}`} />
                <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
