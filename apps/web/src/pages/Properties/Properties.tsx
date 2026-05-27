import { useSearchParams } from 'react-router-dom';
import { useMemo } from 'react';
import { SlidersHorizontal } from 'lucide-react';
import { PropertyCard, PropertyCardSkeleton } from '../../components/Property/PropertyCard';
import { useProperties } from '../../hooks/useProperties';
import type { Property, PropertySearchFilters } from '@metriva/shared';

export default function Properties() {
  const [searchParams, setSearchParams] = useSearchParams();

  const filters: PropertySearchFilters = useMemo(() => ({
    city: searchParams.get('city') ?? undefined,
    listingType: (searchParams.get('listingType') as PropertySearchFilters['listingType']) ?? 'BUY',
    type: searchParams.get('type') as PropertySearchFilters['type'] ?? undefined,
    query: searchParams.get('query') ?? undefined,
    minPrice: searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : undefined,
    maxPrice: searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined,
    bedrooms: searchParams.get('bedrooms') ? [Number(searchParams.get('bedrooms'))] : undefined,
    sortBy: (searchParams.get('sortBy') as PropertySearchFilters['sortBy']) ?? 'newest',
    page: Number(searchParams.get('page') ?? 1),
    limit: 20,
  }), [searchParams]);

  const { data, isLoading } = useProperties(filters);
  const { items = [], meta } = data ?? {};

  return (
    <div className="container py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">
            {filters.city ? `Properties in ${filters.city}` : 'All Properties'}
          </h1>
          {meta && (
            <p className="text-muted-foreground text-sm mt-1">{meta.total.toLocaleString('en-IN')} properties found</p>
          )}
        </div>
        <button className="flex items-center gap-2 px-4 py-2 border border-border rounded-xl text-sm hover:bg-accent transition-colors">
          <SlidersHorizontal className="h-4 w-4" /> Filters
        </button>
      </div>

      {/* Sort bar */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {[
          { label: 'Newest', value: 'newest' },
          { label: 'Price: Low to High', value: 'price_asc' },
          { label: 'Price: High to Low', value: 'price_desc' },
          { label: 'Trust Score', value: 'trust_score' },
        ].map((opt) => (
          <button
            key={opt.value}
            onClick={() => {
              searchParams.set('sortBy', opt.value);
              setSearchParams(searchParams);
            }}
            className={`px-3 py-1.5 rounded-full text-sm whitespace-nowrap transition-colors ${
              filters.sortBy === opt.value
                ? 'bg-brand-500 text-white'
                : 'border border-border hover:bg-accent'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {isLoading
          ? Array.from({ length: 12 }).map((_, i) => <PropertyCardSkeleton key={i} />)
          : items.map((property: Property) => <PropertyCard key={property.id} property={property} />)
        }
      </div>

      {!isLoading && items.length === 0 && (
        <div className="text-center py-24 text-muted-foreground">
          <p className="text-lg font-medium mb-2">No properties found</p>
          <p className="text-sm">Try adjusting your filters or search in a different city</p>
        </div>
      )}

      {/* Pagination */}
      {meta && meta.totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-10">
          {Array.from({ length: Math.min(meta.totalPages, 10) }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => { searchParams.set('page', String(p)); setSearchParams(searchParams); }}
              className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                meta.page === p ? 'bg-brand-500 text-white' : 'border border-border hover:bg-accent'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
