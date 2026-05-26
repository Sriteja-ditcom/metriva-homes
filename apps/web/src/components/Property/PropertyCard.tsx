import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Bath, Bed, Building, Heart, MapPin, Maximize2, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import type { Property } from '@metriva/shared';
import { formatPrice, getPrimaryImage, timeAgo } from '@metriva/shared';
import { TrustBadge } from './TrustBadge';
import { useToggleSave } from '../../hooks/useProperties';
import { usePropertyStore } from '../../store/property.store';
import { cn } from '../../lib/utils';

interface PropertyCardProps {
  property: Property;
  variant?: 'default' | 'compact' | 'featured';
}

export function PropertyCard({ property, variant = 'default' }: PropertyCardProps) {
  const { id, title, price, locality, city, bedrooms, bathrooms, builtUpArea,
    listingType, type, images, aiTrustScore, isVerified, postedAt, isFeatured } = property;

  const savedIds = usePropertyStore((s) => s.savedIds);
  const isSaved = savedIds.has(id);
  const { mutate: toggleSave, isPending } = useToggleSave(id);
  const primaryImage = getPrimaryImage(images);
  const [imgError, setImgError] = useState(false);

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'group relative bg-card rounded-2xl border border-border overflow-hidden',
        'hover:shadow-lg hover:border-brand-200 transition-all duration-300',
        isFeatured && 'ring-2 ring-brand-500 ring-offset-1',
      )}
    >
      {/* Image */}
      <Link to={`/properties/${id}`} className="block relative">
        <div className="aspect-[16/10] bg-muted overflow-hidden">
          <img
            src={imgError ? '/placeholder-property.jpg' : primaryImage}
            alt={title}
            onError={() => setImgError(true)}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        </div>

        {/* Badges */}
        <div className="absolute top-3 left-3 flex gap-2 flex-wrap">
          <span className={cn(
            'px-2.5 py-1 rounded-full text-xs font-semibold',
            listingType === 'BUY' ? 'bg-brand-500 text-white' :
            listingType === 'RENT' ? 'bg-green-500 text-white' :
            'bg-purple-500 text-white',
          )}>
            {listingType}
          </span>
          {isFeatured && (
            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500 text-white">
              Featured
            </span>
          )}
        </div>

        {/* Verified badge */}
        {isVerified && (
          <div className="absolute top-3 right-12 bg-green-500/90 text-white rounded-full p-1" title="Verified">
            <ShieldCheck className="h-3.5 w-3.5" />
          </div>
        )}

        {/* Save button */}
        <button
          onClick={(e) => { e.preventDefault(); toggleSave(); }}
          disabled={isPending}
          className={cn(
            'absolute top-3 right-3 p-2 rounded-full transition-all',
            isSaved
              ? 'bg-red-500 text-white'
              : 'bg-white/80 text-foreground hover:bg-white',
          )}
        >
          <Heart className={cn('h-4 w-4', isSaved && 'fill-current')} />
        </button>
      </Link>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-1.5">
          <h3 className="font-semibold text-base leading-snug line-clamp-2 flex-1">
            <Link to={`/properties/${id}`} className="hover:text-brand-500 transition-colors">
              {title}
            </Link>
          </h3>
        </div>

        <div className="flex items-center gap-1 text-muted-foreground text-sm mb-3">
          <MapPin className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate">{locality}, {city}</span>
        </div>

        {/* Price */}
        <div className="flex items-end justify-between mb-3">
          <div>
            <p className="text-xl font-bold text-foreground">{formatPrice(price)}</p>
            {builtUpArea && (
              <p className="text-xs text-muted-foreground">
                {formatPrice(Math.round(price / builtUpArea))}/sqft
              </p>
            )}
          </div>
          {aiTrustScore != null && (
            <TrustBadge score={aiTrustScore} size="sm" showLabel={false} />
          )}
        </div>

        {/* Property stats */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground border-t border-border pt-3">
          {bedrooms != null && (
            <span className="flex items-center gap-1">
              <Bed className="h-3.5 w-3.5" />
              {bedrooms} BHK
            </span>
          )}
          {bathrooms != null && (
            <span className="flex items-center gap-1">
              <Bath className="h-3.5 w-3.5" />
              {bathrooms}
            </span>
          )}
          {builtUpArea && (
            <span className="flex items-center gap-1">
              <Maximize2 className="h-3.5 w-3.5" />
              {builtUpArea.toLocaleString('en-IN')} sqft
            </span>
          )}
          <span className="flex items-center gap-1 ml-auto">
            <Building className="h-3.5 w-3.5" />
            {type.charAt(0) + type.slice(1).toLowerCase()}
          </span>
        </div>

        <p className="text-xs text-muted-foreground mt-2">{timeAgo(postedAt)}</p>
      </div>
    </motion.article>
  );
}

export function PropertyCardSkeleton() {
  return (
    <div className="rounded-2xl border border-border overflow-hidden">
      <div className="aspect-[16/10] skeleton" />
      <div className="p-4 space-y-3">
        <div className="h-5 skeleton rounded w-3/4" />
        <div className="h-4 skeleton rounded w-1/2" />
        <div className="h-6 skeleton rounded w-1/3" />
        <div className="flex gap-4">
          <div className="h-4 skeleton rounded w-16" />
          <div className="h-4 skeleton rounded w-16" />
          <div className="h-4 skeleton rounded w-20" />
        </div>
      </div>
    </div>
  );
}
