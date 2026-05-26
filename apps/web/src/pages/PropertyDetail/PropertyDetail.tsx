import { useParams } from 'react-router-dom';
import { Bath, Bed, Building, Calendar, Heart, Loader2, MapPin, Maximize2, Phone, Share2, ShieldCheck } from 'lucide-react';
import { useProperty, useToggleSave } from '../../hooks/useProperties';
import { usePropertyStore } from '../../store/property.store';
import { TrustBadge, TrustScoreBar } from '../../components/Property/TrustBadge';
import { formatPrice, timeAgo } from '@metriva/shared';

export default function PropertyDetail() {
  const { id } = useParams<{ id: string }>();
  const { data: property, isLoading } = useProperty(id!);
  const savedIds = usePropertyStore((s) => s.savedIds);
  const isSaved = savedIds.has(id!);
  const { mutate: toggleSave } = useToggleSave(id!);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
      </div>
    );
  }

  if (!property) return <div className="container py-16 text-center text-muted-foreground">Property not found</div>;

  const primaryImage = property.images.find((img) => img.isPrimary) ?? property.images[0];

  return (
    <div className="container py-8 max-w-6xl">
      {/* Image Gallery */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-8 rounded-2xl overflow-hidden h-[400px]">
        <div className="bg-muted h-full">
          {primaryImage && (
            <img src={primaryImage.url} alt={property.title} className="w-full h-full object-cover" />
          )}
        </div>
        <div className="grid grid-cols-2 gap-3">
          {property.images.slice(1, 5).map((img) => (
            <div key={img.id} className="bg-muted rounded-xl overflow-hidden">
              <img src={img.url} alt="" className="w-full h-full object-cover" />
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header */}
          <div>
            <div className="flex items-start justify-between gap-4 mb-3">
              <div>
                <h1 className="text-2xl font-bold">{property.title}</h1>
                <div className="flex items-center gap-1.5 text-muted-foreground mt-1.5">
                  <MapPin className="h-4 w-4" />
                  <span>{property.address}, {property.locality}, {property.city}</span>
                </div>
              </div>
              <div className="flex gap-2 shrink-0">
                <button onClick={() => toggleSave()} className={`p-2.5 rounded-xl border ${isSaved ? 'bg-red-50 border-red-200 text-red-500' : 'border-border hover:bg-accent'}`}>
                  <Heart className={`h-5 w-5 ${isSaved ? 'fill-current' : ''}`} />
                </button>
                <button className="p-2.5 rounded-xl border border-border hover:bg-accent">
                  <Share2 className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="text-3xl font-bold text-brand-600">{formatPrice(property.price)}</div>
            {property.builtUpArea && (
              <p className="text-muted-foreground text-sm mt-0.5">
                {formatPrice(Math.round(property.price / property.builtUpArea))}/sqft · {property.builtUpArea.toLocaleString('en-IN')} sqft
              </p>
            )}
          </div>

          {/* Property stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-5 bg-muted/30 rounded-2xl border border-border">
            {property.bedrooms != null && (
              <div className="text-center"><Bed className="h-5 w-5 mx-auto mb-1 text-brand-500" /><p className="font-semibold">{property.bedrooms} BHK</p><p className="text-xs text-muted-foreground">Bedrooms</p></div>
            )}
            {property.bathrooms != null && (
              <div className="text-center"><Bath className="h-5 w-5 mx-auto mb-1 text-brand-500" /><p className="font-semibold">{property.bathrooms}</p><p className="text-xs text-muted-foreground">Bathrooms</p></div>
            )}
            {property.builtUpArea && (
              <div className="text-center"><Maximize2 className="h-5 w-5 mx-auto mb-1 text-brand-500" /><p className="font-semibold">{property.builtUpArea.toLocaleString('en-IN')}</p><p className="text-xs text-muted-foreground">sqft</p></div>
            )}
            <div className="text-center"><Building className="h-5 w-5 mx-auto mb-1 text-brand-500" /><p className="font-semibold">{property.furnishing?.replace('_', ' ') ?? 'N/A'}</p><p className="text-xs text-muted-foreground">Furnishing</p></div>
          </div>

          {/* AI Summary */}
          {property.aiSummary && (
            <div className="p-5 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-2xl">
              <div className="flex items-center gap-2 mb-2 text-blue-700 dark:text-blue-400 font-semibold text-sm">
                <span>✨</span> AI-Generated Summary
              </div>
              <p className="text-sm leading-relaxed text-foreground">{property.aiSummary}</p>
            </div>
          )}

          {/* Description */}
          <div>
            <h2 className="text-lg font-semibold mb-3">About this property</h2>
            <p className="text-muted-foreground leading-relaxed">{property.description}</p>
          </div>

          {/* Amenities */}
          {property.amenities.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold mb-3">Amenities</h2>
              <div className="flex flex-wrap gap-2">
                {property.amenities.map((amenity) => (
                  <span key={amenity} className="px-3 py-1.5 bg-muted rounded-lg text-sm">{amenity}</span>
                ))}
              </div>
            </div>
          )}

          {/* Posted info */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground pt-2">
            <Calendar className="h-4 w-4" />
            <span>Posted {timeAgo(property.postedAt)}</span>
            {property.isVerified && (
              <>
                <span>·</span>
                <ShieldCheck className="h-4 w-4 text-green-500" />
                <span className="text-green-600">Verified Listing</span>
              </>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Trust Score Card */}
          {property.aiTrustScore != null && (
            <div className="p-5 bg-card border border-border rounded-2xl">
              <h3 className="font-semibold mb-3">Trust Score</h3>
              <TrustScoreBar score={property.aiTrustScore} />
              <TrustBadge score={property.aiTrustScore} className="mt-3" />
              {property.aiScore && (
                <div className="mt-4 space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-muted-foreground">Fraud Risk</span><span className={property.aiScore.fraudRiskScore > 50 ? 'text-red-500' : 'text-green-600'}>{Math.round(property.aiScore.fraudRiskScore)}/100</span></div>
                  {property.aiScore.contentQuality != null && <div className="flex justify-between"><span className="text-muted-foreground">Content Quality</span><span>{Math.round(property.aiScore.contentQuality)}/100</span></div>}
                </div>
              )}
            </div>
          )}

          {/* Contact Card */}
          <div className="p-5 bg-card border border-border rounded-2xl">
            <h3 className="font-semibold mb-4">Contact Owner</h3>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center font-semibold">
                {property.owner?.firstName?.[0]}
              </div>
              <div>
                <p className="font-medium text-sm">{property.owner?.firstName} {property.owner?.lastName}</p>
                <p className="text-xs text-muted-foreground capitalize">{property.owner?.role.toLowerCase()}</p>
              </div>
            </div>
            <button className="w-full py-2.5 rounded-xl bg-brand-500 text-white font-semibold hover:bg-brand-600 transition-colors flex items-center justify-center gap-2">
              <Phone className="h-4 w-4" /> Request Callback
            </button>
            <button className="w-full py-2.5 rounded-xl border border-border hover:bg-accent transition-colors text-sm font-medium mt-2">
              Send Message
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
